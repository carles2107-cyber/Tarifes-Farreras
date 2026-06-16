"use client";

import { useEffect, useState, useCallback } from "react";
import { Contact } from "@/lib/types";
import { Search, Mail, Phone, Briefcase, Clock, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import { ca } from "date-fns/locale";

const LIFECYCLE_LABELS: Record<string, { label: string; cls: string }> = {
  subscriber:       { label: "Subscriptor",   cls: "bg-slate-100 text-slate-600" },
  lead:             { label: "Lead",           cls: "bg-blue-100 text-blue-700" },
  marketingqualifiedlead: { label: "MQL",     cls: "bg-indigo-100 text-indigo-700" },
  salesqualifiedlead:     { label: "SQL",     cls: "bg-purple-100 text-purple-700" },
  opportunity:      { label: "Oportunitat",   cls: "bg-yellow-100 text-yellow-700" },
  customer:         { label: "Client",        cls: "bg-green-100 text-green-700" },
  evangelist:       { label: "Promotor",      cls: "bg-emerald-100 text-emerald-700" },
  other:            { label: "Altres",        cls: "bg-gray-100 text-gray-600" },
};

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-amber-500",
  "bg-pink-500", "bg-cyan-500", "bg-rose-500", "bg-teal-500",
];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

export default function ClientsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const url = debouncedSearch ? `/api/contacts?q=${encodeURIComponent(debouncedSearch)}` : "/api/contacts";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setContacts(d.contacts ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  const filtered = contacts.filter((c) => {
    if (filter === "all") return true;
    return c.lifecycleStage === filter;
  });

  const stages = [...new Set(contacts.map((c) => c.lifecycleStage).filter(Boolean))];

  return (
    <div className="p-8 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients i contactes</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} contactes</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cerca per nom, empresa, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={clsx(
              "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Tots
          </button>
          {stages.map((s) => {
            const meta = LIFECYCLE_LABELS[s] ?? { label: s, cls: "" };
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={clsx(
                  "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                  filter === s
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-48" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Cap contacte trobat
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Contacte</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden md:table-cell">Empresa</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden lg:table-cell">Estat</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden xl:table-cell">Responsable</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden xl:table-cell">Ofertes</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3 hidden lg:table-cell">Activitat</th>
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => {
                const fullName = `${c.firstName} ${c.lastName}`.trim() || c.email;
                const stage = LIFECYCLE_LABELS[c.lifecycleStage] ?? { label: c.lifecycleStage, cls: "bg-slate-100 text-slate-600" };
                const lastAct = c.lastActivity
                  ? formatDistanceToNow(new Date(c.lastActivity), { addSuffix: true, locale: ca })
                  : null;

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                          avatarColor(c.id)
                        )}>
                          {initials(c.firstName, c.lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{fullName}</p>
                          {c.email && (
                            <p className="text-xs text-slate-400 truncate">{c.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600 truncate max-w-[140px] block">{c.company || "—"}</span>
                      {c.jobTitle && <span className="text-xs text-slate-400">{c.jobTitle}</span>}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className={clsx("text-xs font-medium px-2 py-1 rounded-full", stage.cls)}>
                        {stage.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <span className="text-sm text-slate-600">{c.ownerName || "—"}</span>
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      {c.dealCount > 0 ? (
                        <span className="text-sm font-medium text-blue-600">{c.dealCount}</span>
                      ) : (
                        <span className="text-sm text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {lastAct ? (
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {lastAct}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
