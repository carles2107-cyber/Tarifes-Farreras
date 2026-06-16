import { NextResponse } from "next/server";
import { getHubSpotClient } from "@/lib/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    const client = getHubSpotClient();

    const searchBody: Record<string, unknown> = {
      filterGroups: ownerId
        ? [{ filters: [{ propertyName: "hubspot_owner_id", operator: "EQ", value: ownerId }] }]
        : [],
      properties: [
        "dealname",
        "amount",
        "dealstage",
        "closedate",
        "hubspot_owner_id",
        "hs_probability",
        "pipeline",
        "hs_deal_stage_probability",
        "createdate",
        "hs_lastmodifieddate",
      ],
      limit: 200,
      after: 0,
      sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }],
    };

    const response = await client.apiRequest({
      method: "POST",
      path: "/crm/v3/objects/deals/search",
      body: searchBody,
    });

    const data = await response.json() as {
      results: Array<{ id: string; properties: Record<string, string> }>;
      total: number;
    };

    const ownersResp = await client.crm.owners.ownersApi.getPage(undefined, undefined, 100);
    const ownerMap: Record<string, string> = {};
    for (const o of ownersResp.results) {
      ownerMap[String(o.id)] = `${o.firstName ?? ""} ${o.lastName ?? ""}`.trim();
    }

    const deals = data.results.map((d) => ({
      id: d.id,
      name: d.properties.dealname ?? "Sense nom",
      amount: parseFloat(d.properties.amount ?? "0") || 0,
      stage: d.properties.dealstage ?? "",
      closeDate: d.properties.closedate ?? "",
      ownerId: d.properties.hubspot_owner_id ?? "",
      ownerName: ownerMap[d.properties.hubspot_owner_id ?? ""] ?? "Desconegut",
      companyName: "",
      probability: parseFloat(d.properties.hs_deal_stage_probability ?? d.properties.hs_probability ?? "0") * 100,
      createdAt: d.properties.createdate ?? "",
      updatedAt: d.properties.hs_lastmodifieddate ?? "",
      currency: "EUR",
    }));

    return NextResponse.json({ deals, total: data.total });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconegut";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
