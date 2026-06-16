import { NextResponse } from "next/server";
import { getHubSpotClient } from "@/lib/hubspot";

export async function GET() {
  try {
    const client = getHubSpotClient();

    const [ownersResp, dealsResp] = await Promise.all([
      client.crm.owners.ownersApi.getPage(undefined, undefined, 100),
      client.apiRequest({
        method: "POST",
        path: "/crm/v3/objects/deals/search",
        body: {
          filterGroups: [],
          properties: ["dealname", "amount", "dealstage", "hubspot_owner_id"],
          limit: 200,
          after: 0,
          sorts: [],
        },
      }).then((r) => r.json() as Promise<{
        results: Array<{ id: string; properties: Record<string, string> }>;
        total: number;
      }>),
    ]);

    const stats: Record<string, { active: number; won: number; lost: number; revenue: number }> = {};
    for (const d of dealsResp.results) {
      const oid = d.properties.hubspot_owner_id ?? "unknown";
      if (!stats[oid]) stats[oid] = { active: 0, won: 0, lost: 0, revenue: 0 };
      const stage = (d.properties.dealstage ?? "").toLowerCase();
      if (stage === "closedwon") {
        stats[oid].won++;
        stats[oid].revenue += parseFloat(d.properties.amount ?? "0") || 0;
      } else if (stage === "closedlost") {
        stats[oid].lost++;
      } else {
        stats[oid].active++;
      }
    }

    const owners = ownersResp.results.map((o) => ({
      id: String(o.id),
      firstName: o.firstName ?? "",
      lastName: o.lastName ?? "",
      email: o.email ?? "",
      userId: o.userId,
      activeDeals: stats[String(o.id)]?.active ?? 0,
      wonDeals: stats[String(o.id)]?.won ?? 0,
      lostDeals: stats[String(o.id)]?.lost ?? 0,
      totalRevenue: stats[String(o.id)]?.revenue ?? 0,
    }));

    return NextResponse.json({ owners });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconegut";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
