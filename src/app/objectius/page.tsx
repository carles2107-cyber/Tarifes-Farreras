"use client";

import clsx from "clsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const ANNUAL_TARGET = 3_000_000;
const MONTHLY_TARGET = ANNUAL_TARGET / 12; // 250.000 € / mes

const MONTHLY_DATA = [
  { mes: "Gen", vendes2026: 363_732.05, vendes2025: 302_149.07 },
  { mes: "Feb", vendes2026: 268_513.76, vendes2025: 200_067.10 },
  { mes: "Mar", vendes2026: 268_438.75, vendes2025: 304_935.32 },
  { mes: "Abr", vendes2026: 160_546.57, vendes2025: 269_241.38 },
  { mes: "Mai", vendes2026: 349_347.87, vendes2025: 288_203.81 },
  { mes: "Jun", vendes2026: null,        vendes2025: 205_402.31 },
  { mes: "Jul", vendes2026: null,        vendes2025: 232_835.70 },
  { mes: "Ago", vendes2026: null,        vendes2025: 150_480.27 },
  { mes: "Set", vendes2026: null,        vendes2025: 298_432.38 },
  { mes: "Oct", vendes2026: null,        vendes2025: 271_128.69 },
  { mes: "Nov", vendes2026: null,        vendes2025: 355_402.56 },
  { mes: "Des", vendes2026: null,        vendes2025: 251_188.72 },
];

const FAMILIES = [
  { nom: "Melamina disseny",       objectiu: 500_000, assolit: 180_823.66, color: "bg-blue-500" },
  { nom: "Allistonats/Tricapes",   objectiu: 200_000, assolit: 50_157.71,  color: "bg-purple-500" },
  { nom: "Parquet total",          objectiu: 220_000, assolit: 22_435.22,  color: "bg-amber-500" },
  { nom: "Tricapa/Allist. Roure",  objectiu: 125_000, assolit: 33_001.10,  color: "bg-green-500" },
  { nom: "Premium (Saviola/Ligna)",objectiu: 150_000, assolit: 27_520.34,  color: "bg-rose-500" },
  { nom: "Lalur",                  objectiu: 100_000, assolit: 3_191.86,   color: "bg-cyan-500" },
];

const fmt = (v: number) =>
  new Intl.NumberFormat("ca-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

const pct = (v: number, total: number) => Math.min(100, (v / total) * 100);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-800">
            {p.value != null ? fmt(p.value) : "—"}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        <span className="text-slate-400">Objectiu mensual:</span>
        <span className="font-medium text-slate-600">{fmt(MONTHLY_TARGET)}</span>
      </div>
    </div>
  );
};

export default function ObjectiusPage() {
  const vendesActuals = MONTHLY_DATA.filter((m) => m.vendes2026 != null)
    .reduce((s, m) => s + (m.vendes2026 ?? 0), 0);
  const pctAssolit = pct(vendesActuals, ANNUAL_TARGET);
  const faltaPerObj = ANNUAL_TARGET - vendesActuals;
  const mesos2026 = MONTHLY_DATA.filter((m) => m.vendes2026 != null).length;
  const objectiuAcumulat = MONTHLY_TARGET * mesos2026;
  const diffVs2025 = 1_410_579 - 1_364_596.68;

  const chartData = MONTHLY_DATA.map((m) => ({
    ...m,
    objectiu: MONTHLY_TARGET,
  }));

  return (
    <div className="p-8 fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Objectius 2026</h1>
        <p className="text-slate-500 text-sm mt-0.5">Carles Castañé · Farreras</p>
      </div>

      {/* KPI top cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 mb-1">Objectiu anual</p>
          <p className="text-2xl font-bold text-slate-900">{fmt(ANNUAL_TARGET)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 mb-1">Vendes Gen–Mai 2026</p>
          <p className="text-2xl font-bold text-blue-600">{fmt(vendesActuals)}</p>
          <p className="text-xs text-green-600 font-medium mt-1">+{fmt(diffVs2025)} vs 2025</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 mb-1">Falta per objectiu</p>
          <p className="text-2xl font-bold text-red-500">{fmt(faltaPerObj)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-400 mb-1">% assolit</p>
          <p className="text-2xl font-bold text-slate-900">{pctAssolit.toFixed(2)}%</p>
          <p className="text-xs text-slate-400 mt-1">Obj. acumulat: {fmt(objectiuAcumulat)}</p>
        </div>
      </div>

      {/* Progress bar anual */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Progrés anual</h2>
          <span className="text-sm font-bold text-blue-600">{pctAssolit.toFixed(1)}%</span>
        </div>
        <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${pctAssolit}%` }}
          />
          {/* marca 50% */}
          <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white/60" />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1.5">
          <span>0€</span>
          <span className="text-slate-500 font-medium">50% · {fmt(ANNUAL_TARGET / 2)}</span>
          <span>{fmt(ANNUAL_TARGET)}</span>
        </div>

        {/* Marker acumulat vs objectiu acumulat */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <span className="text-slate-600">Vendes reals: <strong>{fmt(vendesActuals)}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-slate-400 shrink-0" />
            <span className="text-slate-600">Obj. acumulat ({mesos2026}m): <strong>{fmt(objectiuAcumulat)}</strong></span>
          </div>
          <div className={clsx(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            vendesActuals >= objectiuAcumulat ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          )}>
            {vendesActuals >= objectiuAcumulat ? "▲" : "▼"}
            {fmt(Math.abs(vendesActuals - objectiuAcumulat))}
            {vendesActuals >= objectiuAcumulat ? " per sobre" : " per sota"}
          </div>
        </div>
      </div>

      {/* Gràfic mensual */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-6">Vendes mensuals · 2026 vs 2025 vs Objectiu</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              formatter={(v) => v === "vendes2026" ? "2026" : v === "vendes2025" ? "2025" : "Objectiu"}
            />
            <ReferenceLine y={MONTHLY_TARGET} stroke="#94a3b8" strokeDasharray="4 4" />
            <Bar dataKey="vendes2025" name="vendes2025" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
            <Bar dataKey="vendes2026" name="vendes2026" fill="#2563eb" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Taula mensual detallada */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Mes</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">2026</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">2025</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Diferència</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">vs Objectiu mensual</th>
              <th className="w-32 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MONTHLY_DATA.map((m) => {
              const diff = m.vendes2026 != null ? m.vendes2026 - m.vendes2025 : null;
              const diffPct = diff != null ? (diff / m.vendes2025) * 100 : null;
              const vsObj = m.vendes2026 != null ? m.vendes2026 - MONTHLY_TARGET : null;
              const isPast = m.vendes2026 != null;

              return (
                <tr key={m.mes} className={clsx("transition-colors", isPast ? "hover:bg-slate-50" : "opacity-50")}>
                  <td className="px-6 py-3 text-sm font-medium text-slate-700">{m.mes}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-blue-700">
                    {m.vendes2026 != null ? fmt(m.vendes2026) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-500">
                    {fmt(m.vendes2025)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {diff != null ? (
                      <span className={diff >= 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                        {diff >= 0 ? "+" : ""}{fmt(diff)}
                        <span className="text-xs ml-1 opacity-70">({diffPct! >= 0 ? "+" : ""}{diffPct!.toFixed(1)}%)</span>
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {vsObj != null ? (
                      <span className={vsObj >= 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                        {vsObj >= 0 ? "+" : ""}{fmt(vsObj)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {m.vendes2026 != null && (
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            "h-full rounded-full",
                            m.vendes2026 >= MONTHLY_TARGET ? "bg-green-500" : "bg-red-400"
                          )}
                          style={{ width: `${Math.min(100, pct(m.vendes2026, MONTHLY_TARGET))}%` }}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 border-t-2 border-slate-200">
            <tr>
              <td className="px-6 py-3 text-sm font-bold text-slate-800">TOTAL Gen–Mai</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-blue-700">{fmt(vendesActuals)}</td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-slate-600">{fmt(1_364_596.68)}</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-green-600">+{fmt(diffVs2025)}</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-red-500">{fmt(vendesActuals - objectiuAcumulat)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Objectius per família */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Objectius per família de producte</h2>
        <div className="space-y-4">
          {FAMILIES.map((f) => {
            const p = pct(f.assolit, f.objectiu);
            return (
              <div key={f.nom}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={clsx("w-2.5 h-2.5 rounded-full shrink-0", f.color)} />
                    <span className="text-sm font-medium text-slate-700">{f.nom}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">{fmt(f.assolit)}</span>
                    <span className="text-xs text-slate-400 ml-1">/ {fmt(f.objectiu)}</span>
                    <span className={clsx(
                      "text-xs font-bold ml-2",
                      p >= 50 ? "text-green-600" : p >= 25 ? "text-amber-600" : "text-red-500"
                    )}>
                      {p.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx("h-full rounded-full transition-all duration-500", f.color)}
                    style={{ width: `${p}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
