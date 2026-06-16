import clsx from "clsx";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "purple";
  loading?: boolean;
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-600",   badge: "text-blue-600" },
  green:  { bg: "bg-green-50",  icon: "bg-green-100 text-green-600", badge: "text-green-600" },
  yellow: { bg: "bg-yellow-50", icon: "bg-amber-100 text-amber-600", badge: "text-amber-600" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", badge: "text-purple-600" },
};

export default function KPICard({
  label,
  value,
  change,
  changeLabel,
  icon,
  color = "blue",
  loading,
}: KPICardProps) {
  const colors = colorMap[color];
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 card-hover">
      <div className="flex items-start justify-between">
        <div className={clsx("p-2.5 rounded-lg", colors.icon)}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={clsx(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}>
            {isPositive
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="h-7 w-24 bg-slate-200 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        )}
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </div>
      {changeLabel && (
        <p className="text-xs text-slate-400 mt-2">{changeLabel}</p>
      )}
    </div>
  );
}
