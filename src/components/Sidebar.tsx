"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  Users,
  UserCog,
  TrendingUp,
  Settings,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/",         icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pipeline", icon: Kanban,           label: "Pipeline" },
  { href: "/clients",  icon: Users,            label: "Clients" },
  { href: "/team",     icon: UserCog,          label: "Equip" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-slate-900 text-white flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight">Farreras</p>
          <p className="text-xs text-slate-400">Sales Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-700">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          Configuració
        </Link>
        <div className="mt-4 px-3">
          <p className="text-xs text-slate-500">Connectat a HubSpot</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            <span className="text-xs text-slate-400">En línia</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
