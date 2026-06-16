import { NextResponse } from "next/server";
import { getHubSpotClient } from "@/lib/hubspot";
import type { PublicObjectSearchRequest } from "@hubspot/api-client/lib/codegen/crm/contacts";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");
    const query = searchParams.get("q") ?? undefined;

    const client = getHubSpotClient();

    const searchBody: Record<string, unknown> = {
      filterGroups: ownerId
        ? [{ filters: [{ propertyName: "hubspot_owner_id", operator: "EQ", value: ownerId }] }]
        : [],
      properties: [
        "firstname",
        "lastname",
        "email",
        "phone",
        "company",
        "jobtitle",
        "lifecyclestage",
        "hubspot_owner_id",
        "notes_last_updated",
        "createdate",
        "num_associated_deals",
      ],
      limit: 100,
      after: 0,
      sorts: [{ propertyName: "notes_last_updated", direction: "DESCENDING" }],
    };

    if (query) searchBody.query = query;

    const response = await client.apiRequest({
      method: "POST",
      path: "/crm/v3/objects/contacts/search",
      body: searchBody,
    });

    const data = await response.json() as {
      results: Array<{ id: string; properties: Record<string, string> }>;
      total: number;
    };

    const ownerIds = [...new Set(
      data.results.map((c) => c.properties.hubspot_owner_id).filter(Boolean)
    )];

    const ownerMap: Record<string, string> = {};
    if (ownerIds.length > 0) {
      const ownersResp = await client.crm.owners.ownersApi.getPage(undefined, undefined, 100);
      for (const o of ownersResp.results) {
        ownerMap[String(o.id)] = `${o.firstName ?? ""} ${o.lastName ?? ""}`.trim();
      }
    }

    const contacts = data.results.map((c) => ({
      id: c.id,
      firstName: c.properties.firstname ?? "",
      lastName: c.properties.lastname ?? "",
      email: c.properties.email ?? "",
      phone: c.properties.phone ?? "",
      company: c.properties.company ?? "",
      jobTitle: c.properties.jobtitle ?? "",
      lifecycleStage: c.properties.lifecyclestage ?? "",
      ownerId: c.properties.hubspot_owner_id ?? "",
      ownerName: ownerMap[c.properties.hubspot_owner_id ?? ""] ?? "",
      lastActivity: c.properties.notes_last_updated ?? c.properties.createdate ?? "",
      createdAt: c.properties.createdate ?? "",
      dealCount: parseInt(c.properties.num_associated_deals ?? "0") || 0,
    }));

    return NextResponse.json({ contacts, total: data.total });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconegut";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
