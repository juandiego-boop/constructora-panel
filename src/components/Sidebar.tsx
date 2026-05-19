"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  HardHat,
  DollarSign,
  Package,
  ClipboardList,
  Settings,
  Building2,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { href: "/prospectos",  label: "Prospectos",   icon: Users },
  { href: "/obras",       label: "Obras",        icon: HardHat },
  { href: "/finanzas",    label: "Finanzas",     icon: DollarSign },
  { href: "/inventario",  label: "Inventario",   icon: Package },
  { href: "/tareas",      label: "Tareas",       icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-[#1a5276] text-white flex flex-col shadow-xl z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <Building2 className="w-8 h-8 text-white" />
        <div>
          <p className="font-bold text-base leading-tight">CONSTRUCTORA</p>
          <p className="text-xs text-blue-200 font-medium">Panel de Gestión</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10 text-xs text-blue-200">
        <p className="font-medium">Sistema v1.0</p>
        <p>Powered by n8n + Supabase</p>
      </div>
    </aside>
  );
}
