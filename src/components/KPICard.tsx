import clsx from "clsx";
import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
  trend?: { value: number; label: string };
};

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "bg-[#1a5276] text-white",   border: "border-blue-100" },
  green:  { bg: "bg-green-50",  icon: "bg-green-600 text-white",   border: "border-green-100" },
  red:    { bg: "bg-red-50",    icon: "bg-red-600 text-white",     border: "border-red-100" },
  yellow: { bg: "bg-yellow-50", icon: "bg-yellow-500 text-white",  border: "border-yellow-100" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-600 text-white",  border: "border-purple-100" },
};

export default function KPICard({ title, value, subtitle, icon: Icon, color = "blue", trend }: Props) {
  const c = colorMap[color];
  return (
    <div className={clsx("rounded-xl border p-5 flex items-start gap-4 shadow-sm", c.bg, c.border)}>
      <div className={clsx("p-3 rounded-lg flex-shrink-0", c.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800 truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <p className={clsx("text-xs font-medium mt-1", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
