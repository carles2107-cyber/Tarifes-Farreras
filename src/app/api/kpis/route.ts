import { NextResponse } from "next/server";
import { getHubSpotClient } from "@/lib/hubspot";

function getMonthRange(monthsAgo: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

type DealResult = { id: string; properties: Record<string, string> };

async function searchDeals(
  client: ReturnType<typeof import("@/lib/hubspot").getHubSpotClient>,
  filters: Array<{ propertyName: string; operator: string; value: string }>
): Promise<{ results: DealResult[]; total: number }> {
  const response = await client.apiRequest({
    method: "POST",
    path: "/crm/v3/objects/deals/search",
    body: {
      filterGroups: [{ filters }],
      properties: ["amount", "dealstage", "closedate", "createdate", "hs_deal_stage_probability"],
      limit: 200,
      after: 0,
      sorts: [],
    },
  });
  return response.json() as Promise<{ results: DealResult[]; total: number }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    const client = getHubSpotClient();

    const ownerFilter = ownerId
      ? [{ propertyName: "hubspot_owner_id", operator: "EQ", value: ownerId }]
      : [];

    const thisMonth = getMonthRange(0);
    const lastMonth = getMonthRange(1);

    const [thisMonthDeals, lastMonthDeals, activeDeals, allDeals] = await Promise.all([
      searchDeals(client, [
        ...ownerFilter,
        { propertyName: "dealstage", operator: "EQ", value: "closedwon" },
        { propertyName: "closedate", operator: "GTE", value: thisMonth.start },
        { propertyName: "closedate", operator: "LTE", value: thisMonth.end },
      ]),
      searchDeals(client, [
        ...ownerFilter,
        { propertyName: "dealstage", operator: "EQ", value: "closedwon" },
        { propertyName: "closedate", operator: "GTE", value: lastMonth.start },
        { propertyName: "closedate", operator: "LTE", value: lastMonth.end },
      ]),
      searchDeals(client, [
        ...ownerFilter,
        { propertyName: "dealstage", operator: "NEQ", value: "closedwon" },
        { propertyName: "dealstage", operator: "NEQ", value: "closedlost" },
      ]),
      searchDeals(client, ownerFilter),
    ]);

    const thisMonthRevenue = thisMonthDeals.results.reduce(
      (sum, d) => sum + (parseFloat(d.properties.amount ?? "0") || 0), 0
    );
    const lastMonthRevenue = lastMonthDeals.results.reduce(
      (sum, d) => sum + (parseFloat(d.properties.amount ?? "0") || 0), 0
    );

    const pipelineValue = activeDeals.results.reduce((sum, d) => {
      const amount = parseFloat(d.properties.amount ?? "0") || 0;
      const prob = parseFloat(d.properties.hs_deal_stage_probability ?? "0");
      return sum + amount * prob;
    }, 0);

    const revenueChange = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    const wonThisMonth = thisMonthDeals.total;
    const wonLastMonth = lastMonthDeals.total;
    const dealsChange = wonLastMonth > 0
      ? ((wonThisMonth - wonLastMonth) / wonLastMonth) * 100
      : 0;

    const monthlyTrend: Array<{ month: string; revenue: number; deals: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const range = getMonthRange(i);
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = date.toLocaleDateString("ca-ES", { month: "short", year: "numeric" });

      const startTs = new Date(range.start).getTime();
      const endTs = new Date(range.end).getTime() + 86400000;

      const monthDeals = allDeals.results.filter((d) => {
        const closeTs = new Date(d.properties.closedate ?? "").getTime();
        const stage = d.properties.dealstage ?? "";
        return (stage === "closedwon") && closeTs >= startTs && closeTs <= endTs;
      });

      monthlyTrend.push({
        month: monthLabel,
        revenue: monthDeals.reduce((s, d) => s + (parseFloat(d.properties.amount ?? "0") || 0), 0),
        deals: monthDeals.length,
      });
    }

    return NextResponse.json({
      kpis: {
        thisMonthRevenue,
        lastMonthRevenue,
        revenueChange,
        wonDealsThisMonth: wonThisMonth,
        wonDealsLastMonth: wonLastMonth,
        dealsChange,
        activeDeals: activeDeals.total,
        pipelineValue,
      },
      monthlyTrend,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconegut";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
