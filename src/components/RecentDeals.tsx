"use client";

import { useEffect, useState } from "react";
import { formatCurrency, stageColorClass } from "@/lib/hubspot";
import { Deal } from "@/lib/types";
import clsx from "clsx";

export default function RecentDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((d) => setDeals((d.deals ?? []).slice(0, 8)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 h-full">
      <h2 className="font-semibold text-slate-900 mb-4">Ofertes recents</h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">Sense ofertes recents</p>
      ) : (
        <ul className="space-y-3">
          {deals.map((deal) => (
            <li key={deal.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{deal.name}</p>
                <p className="text-xs text-slate-400 truncate">{deal.companyName || deal.ownerName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-900">
                  {deal.amount > 0 ? formatCurrency(deal.amount) : "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
