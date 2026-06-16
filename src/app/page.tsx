"use client";

import { useEffect, useState } from "react";
import { Euro, TrendingUp, Briefcase, Activity } from "lucide-react";
import KPICard from "@/components/KPICard";
import SalesChart from "@/components/SalesChart";
import RecentDeals from "@/components/RecentDeals";
import { formatCurrency } from "@/lib/hubspot";

interface KPIsData {
  thisMonthRevenue: number;
  revenueChange: number;
  wonDealsThisMonth: number;
  dealsChange: number;
  activeDeals: number;
  pipelineValue: number;
}

interface TrendPoint {
  month: string;
  revenue: number;
  deals: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIsData | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kpis")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setKpis(data.kpis);
        setTrend(data.monthlyTrend ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const monthName = now.toLocaleDateString("ca-ES", { month: "long", year: "numeric" });

  return (
    <div className="p-8 fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1 capitalize">{monthName}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <strong>Error de connexió amb HubSpot:</strong> {error}
          <p className="mt-1 text-red-500 text-xs">
            Revisa que HUBSPOT_ACCESS_TOKEN estigui configurat correctament als ajustos del servidor.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <KPICard
          label="Facturació del mes"
          value={kpis ? formatCurrency(kpis.thisMonthRevenue) : "—"}
          change={kpis?.revenueChange}
          changeLabel="vs. mes anterior"
          icon={<Euro className="w-5 h-5" />}
          color="blue"
          loading={loading}
        />
        <KPICard
          label="Ofertes guanyades"
          value={kpis ? String(kpis.wonDealsThisMonth) : "—"}
          change={kpis?.dealsChange}
          changeLabel="vs. mes anterior"
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          loading={loading}
        />
        <KPICard
          label="Ofertes actives"
          value={kpis ? String(kpis.activeDeals) : "—"}
          icon={<Briefcase className="w-5 h-5" />}
          color="yellow"
          loading={loading}
        />
        <KPICard
          label="Valor pipeline (ponderat)"
          value={kpis ? formatCurrency(kpis.pipelineValue) : "—"}
          icon={<Activity className="w-5 h-5" />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Charts + Recent Deals */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SalesChart data={trend} loading={loading} />
        </div>
        <div>
          <RecentDeals />
        </div>
      </div>
    </div>
  );
}
