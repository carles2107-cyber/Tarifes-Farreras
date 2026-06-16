"use client";

import { useEffect, useState, useMemo } from "react";
import { Deal, PipelineStage, Pipeline } from "@/lib/types";
import { formatCurrency, stageColorClass } from "@/lib/hubspot";
import { Calendar, User, Building2, BarChart2 } from "lucide-react";
import clsx from "clsx";

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipeline, setActivePipeline] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/deals").then((r) => r.json()),
      fetch("/api/pipeline-stages").then((r) => r.json()),
    ])
      .then(([dealsData, pipelinesData]) => {
        if (dealsData.error) throw new Error(dealsData.error);
        setDeals(dealsData.deals ?? []);
        const pipes: Pipeline[] = pipelinesData.pipelines ?? [];
        setPipelines(pipes);
        if (pipes.length > 0) setActivePipeline(pipes[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const currentPipeline = pipelines.find((p) => p.id === activePipeline);

  const dealsByStage = useMemo(() => {
    if (!currentPipeline) return {};
    const map: Record<string, Deal[]> = {};
    for (const s of currentPipeline.stages) {
      map[s.id] = deals.filter((d) => d.stage === s.id);
    }
    return map;
  }, [deals, currentPipeline]);

  const stageTotal = (stageId: string) =>
    (dealsByStage[stageId] ?? []).reduce((s, d) => s + d.amount, 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-8" />
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-72 shrink-0">
              <div className="h-6 bg-slate-200 rounded animate-pulse mb-3" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-28 bg-slate-100 rounded-xl animate-pulse mb-3" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline d{"'"}ofertes</h1>
          <p className="text-slate-500 text-sm mt-0.5">{deals.length} ofertes en total</p>
        </div>

        {pipelines.length > 1 && (
          <div className="flex gap-2">
            {pipelines.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePipeline(p.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  activePipeline === p.id
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Error: {error}
        </div>
      )}

      {/* Kanban Board */}
      <div className="kanban-scroll pb-6">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {(currentPipeline?.stages ?? []).map((stage) => {
            const stageDeals = dealsByStage[stage.id] ?? [];
            return (
              <div key={stage.id} className="w-72 shrink-0">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">{stage.label}</span>
                    <span className="text-xs bg-slate-200 text-slate-600 font-medium px-1.5 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {formatCurrency(stageTotal(stage.id))}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {stageDeals.length === 0 ? (
                    <div className="h-20 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-xs">
                      Cap oferta
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const closeDate = deal.closeDate
    ? new Date(deal.closeDate).toLocaleDateString("ca-ES", { day: "numeric", month: "short" })
    : null;

  const isPast = deal.closeDate && new Date(deal.closeDate) < new Date();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 card-hover cursor-pointer">
      <p className="text-sm font-semibold text-slate-800 leading-tight mb-1 line-clamp-2">
        {deal.name}
      </p>

      {deal.amount > 0 && (
        <p className="text-base font-bold text-blue-600 mb-3">
          {formatCurrency(deal.amount)}
        </p>
      )}

      <div className="space-y-1.5">
        {deal.ownerName && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3 h-3 shrink-0" />
            <span className="truncate">{deal.ownerName}</span>
          </div>
        )}
        {closeDate && (
          <div className={clsx(
            "flex items-center gap-1.5 text-xs",
            isPast ? "text-red-500" : "text-slate-500"
          )}>
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{closeDate}</span>
            {isPast && <span className="text-xs font-medium">(vençut)</span>}
          </div>
        )}
        {deal.probability > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <BarChart2 className="w-3 h-3 shrink-0" />
            <span>{deal.probability.toFixed(0)}% probabilitat</span>
          </div>
        )}
      </div>
    </div>
  );
}
