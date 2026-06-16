"use client";

import { useEffect, useState } from "react";
import { Owner } from "@/lib/types";
import { formatCurrency } from "@/lib/hubspot";
import { Trophy, Briefcase, TrendingUp, X, Check } from "lucide-react";
import clsx from "clsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-amber-500",
  "bg-pink-500", "bg-cyan-500", "bg-rose-500", "bg-teal-500",
];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
}

export default function TeamPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/owners")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setOwners(d.owners ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const top = [...owners].sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0));

  const chartData = top.slice(0, 8).map((o) => ({
    name: `${o.firstName} ${o.lastName}`.trim() || o.email,
    revenue: o.totalRevenue ?? 0,
    deals: o.wonDeals ?? 0,
  }));

  return (
    <div className="p-8 fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Equip de vendes</h1>
        <p className="text-slate-500 text-sm mt-0.5">{owners.length} comercials</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Error: {error}
        </div>
      )}

      {/* Podium top 3 */}
      {!loading && top.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-xl">
          {[top[1], top[0], top[2]].map((o, idx) => {
            const medals = ["🥈", "🥇", "🥉"];
            const sizes = ["h-20", "h-28", "h-16"];
            return (
              <div key={o.id} className={clsx("flex flex-col items-center justify-end", sizes[idx])}>
                <div className="text-2xl mb-1">{medals[idx]}</div>
                <div className={clsx(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold mb-1",
                  avatarColor(o.id)
                )}>
                  {initials(o.firstName, o.lastName)}
                </div>
                <p className="text-xs font-semibold text-slate-700 text-center leading-tight">
                  {o.firstName}
                </p>
                <p className="text-xs font-bold text-blue-600">
                  {formatCurrency(o.totalRevenue ?? 0)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-6">Facturació per comercial</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), "Facturació"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stats cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Millor del mes</h3>
            </div>
            {loading ? (
              <div className="h-12 bg-slate-100 rounded animate-pulse" />
            ) : top[0] ? (
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                  avatarColor(top[0].id)
                )}>
                  {initials(top[0].firstName, top[0].lastName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {top[0].firstName} {top[0].lastName}
                  </p>
                  <p className="text-xs text-blue-600 font-bold">
                    {formatCurrency(top[0].totalRevenue ?? 0)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Total equip</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(owners.reduce((s, o) => s + (o.totalRevenue ?? 0), 0))}
                </p>
                <p className="text-xs text-slate-400">Facturació total</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {owners.reduce((s, o) => s + (o.wonDeals ?? 0), 0)}
                </p>
                <p className="text-xs text-slate-400">Ofertes guanyades</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking table */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">#</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Comercial</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Facturació</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 hidden md:table-cell">Guanyades</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 hidden md:table-cell">Perdudes</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 hidden lg:table-cell">Actives</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3 hidden lg:table-cell">% èxit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-8 bg-slate-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : (
              top.map((o, idx) => {
                const total = (o.wonDeals ?? 0) + (o.lostDeals ?? 0);
                const pct = total > 0 ? Math.round(((o.wonDeals ?? 0) / total) * 100) : 0;
                const name = `${o.firstName} ${o.lastName}`.trim() || o.email;
                return (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className={clsx(
                        "text-sm font-bold",
                        idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-400" : "text-slate-300"
                      )}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          "w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                          avatarColor(o.id)
                        )}>
                          {initials(o.firstName, o.lastName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{name}</p>
                          <p className="text-xs text-slate-400">{o.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(o.totalRevenue ?? 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className="flex items-center justify-end gap-1 text-sm text-green-600 font-medium">
                        <Check className="w-3.5 h-3.5" /> {o.wonDeals ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className="flex items-center justify-end gap-1 text-sm text-red-400 font-medium">
                        <X className="w-3.5 h-3.5" /> {o.lostDeals ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                      <span className="text-sm text-slate-600">{o.activeDeals ?? 0}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
