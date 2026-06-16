import { NextResponse } from "next/server";
import { getHubSpotClient } from "@/lib/hubspot";

export async function GET() {
  try {
    const client = getHubSpotClient();

    const pipelines = await client.crm.pipelines.pipelinesApi.getAll("deals");

    const result = pipelines.results.map((p) => ({
      id: p.id,
      label: p.label,
      stages: (p.stages ?? [])
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map((s) => ({
          id: s.id,
          label: s.label,
          probability: parseFloat(String(s.metadata?.probability ?? "0")) * 100,
          displayOrder: s.displayOrder ?? 0,
        })),
    }));

    return NextResponse.json({ pipelines: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconegut";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
