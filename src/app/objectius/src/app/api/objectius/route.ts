
import { NextResponse } from "next/server";
import { getHubSpotClient } from "@/lib/hubspot";

const FAMILY_PROPERTY = "familia_de_producte"; // nom intern de la propietat creada a HubSpot
const ANNUAL_TARGET = 3_000_000;

// Objectius anuals per família (ajustables manualment, ja que HubSpot no guarda "objectius")
const FAMILY_TARGETS: Record<string, number> = {
  "Melamina disseny": 500_000,
  "Allistonats/Tricapes": 200_000,
  "Tricapa/Allist. Roure": 125_000,
  "Premium (Saviola/Ligna)": 150_000,
  "Parquet total": 220_000,
  Lalur: 100_000,
  Rocamadera: 0,
  "PET Kronospan": 0,
  Altres: 0,
};

type DealResult = {
  id: string;
  properties: Record<string, string>;
};

async function fetchAllClosedWonDeals(
  client: ReturnType<typeof getHubSpotClient>,
  ownerId?: string | null
): Promise<DealResult[]> {
  const filters: Array<{ propertyName: string; operator: string; value: string }> = [
    { propertyName: "dealstage", operator: "EQ", value: "closedwon" },
  ];
  if (ownerId) {
    filters.push({ propertyName: "hubspot_owner_id", operator: "EQ", value: ownerId });
  }

  const results: DealResult[] = [];
  let after: string | undefined = undefined;

  do {
    const response = await client.apiRequest({
      method: "POST",
      path: "/crm/v3/objects/deals/search",
      body: {
        filterGroups: [{ filters }],
        properties: ["amount", "closedate", FAMILY_PROPERTY, "dealname"],
        limit: 200,
        after,
      },
    });
    const json = (await response.json()) as {
      results: DealResult[];
      paging?: { next?: { after?: string } };
    };
    results.push(...json.results);
    after = json.paging?.next?.after;
  } while (after);

  return results;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");
    const year = new Date().getFullYear();

    const client = getHubSpotClient();
    const deals = await fetchAllClosedWonDeals(client, ownerId);

    // Filtra només l'any actual
    const dealsThisYear = deals.filter((d) => {
      const close = d.properties.closedate;
      return close && new Date(close).getFullYear() === year;
    });

    const dealsLastYear = deals.filter((d) => {
      const close = d.properties.closedate;
      return close && new Date(close).getFullYear() === year - 1;
    });

    // Agrupa per família de producte
    const familyTotals: Record<string, number> = {};
    for (const d of dealsThisYear) {
      const family = d.properties[FAMILY_PROPERTY] || "Altres";
      const amount = parseFloat(d.properties.amount ?? "0") || 0;
      familyTotals[family] = (familyTotals[family] ?? 0) + amount;
    }

    const families = Object.keys(FAMILY_TARGETS).map((nom) => ({
      nom,
      objectiu: FAMILY_TARGETS[nom],
      assolit: familyTotals[nom] ?? 0,
    }));

    // Trend mensual any actual vs any anterior
    const monthLabels = ["Gen", "Feb", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Des"];
    const monthlyData = monthLabels.map((mes, i) => {
      const sum2026 = dealsThisYear
        .filter((d) => new Date(d.properties.closedate).getMonth() === i)
        .reduce((s, d) => s + (parseFloat(d.properties.amount ?? "0") || 0), 0);
      const sum2025 = dealsLastYear
        .filter((d) => new Date(d.properties.closedate).getMonth() === i)
        .reduce((s, d) => s + (parseFloat(d.properties.amount ?? "0") || 0), 0);

      const now = new Date();
      const isFuture = i > now.getMonth();

      return {
        mes,
        vendes2026: isFuture ? null : sum2026,
        vendes2025: sum2025 || null,
      };
    });

    const vendesActuals = dealsThisYear.reduce(
      (s, d) => s + (parseFloat(d.properties.amount ?? "0") || 0),
      0
    );
    const vendesAnyAnterior = dealsLastYear.reduce(
      (s, d) => s + (parseFloat(d.properties.amount ?? "0") || 0),
      0
    );

    return NextResponse.json({
      annualTarget: ANNUAL_TARGET,
      vendesActuals,
      vendesAnyAnterior,
      families,
      monthlyData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconegut";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
