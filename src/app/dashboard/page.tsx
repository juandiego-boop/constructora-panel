export const dynamic = "force-dynamic";

import { supabase, formatPeso } from "@/lib/supabase";
import KPICard from "@/components/KPICard";
import PageHeader from "@/components/PageHeader";
import Badge, { estadoObraVariant, estadoProspectoVariant } from "@/components/Badge";
import {
  HardHat, Users, DollarSign, TrendingUp,
  AlertTriangle, CheckCircle, Package, Calendar,
} from "lucide-react";

 // refresca cada 60s

async function getKPIs() {
  const { data, error } = await supabase.rpc("kpis_generales");
  if (error) return null;
  return data as {
    obras_activas: number;
    total_presupuesto: number;
    total_gastos: number;
    prospectos_nuevos: number;
    clientes_activos: number;
  } | null;
}

async function getObrasActivas() {
  const { data } = await supabase
    .from("v_dashboard_obras")
    .select("*")
    .in("estado", ["en_ejecucion", "pausada"])
    .order("avance_porcentaje", { ascending: true })
    .limit(5);
  return data ?? [];
}

async function getProspectosRecientes() {
  const { data } = await supabase
    .from("prospectos")
    .select("id, nombre, telefono, tipo_proyecto, estado_crm, fuente, presupuesto_estimado, created_at")
    .order("created_at", { ascending: false })
    .limit(6);
  return data ?? [];
}

async function getPagosProximos() {
  const { data } = await supabase
    .from("v_pagos_proximos")
    .select("*")
    .limit(5);
  return data ?? [];
}

async function getStockBajo() {
  const { data } = await supabase
    .from("v_stock_bajo")
    .select("*")
    .limit(4);
  return data ?? [];
}

export default async function DashboardPage() {
  const [kpis, obras, prospectos, pagos, stockBajo] = await Promise.all([
    getKPIs(),
    getObrasActivas(),
    getProspectosRecientes(),
    getPagosProximos(),
    getStockBajo(),
  ]);

  const ejecucion = kpis?.total_presupuesto
    ? Math.round((kpis.total_gastos / kpis.total_presupuesto) * 100)
    : 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Hoy: ${new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Obras Activas"
          value={kpis?.obras_activas ?? "—"}
          subtitle="en ejecución / pausa"
          icon={HardHat}
          color="blue"
        />
        <KPICard
          title="Presupuesto Total"
          value={formatPeso(kpis?.total_presupuesto)}
          subtitle={`${ejecucion}% ejecutado`}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Gastos Ejecutados"
          value={formatPeso(kpis?.total_gastos)}
          subtitle="total acumulado"
          icon={TrendingUp}
          color={ejecucion > 90 ? "red" : "yellow"}
        />
        <KPICard
          title="Prospectos Nuevos"
          value={kpis?.prospectos_nuevos ?? "—"}
          subtitle={`${kpis?.clientes_activos ?? 0} clientes activos`}
          icon={Users}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Obras activas */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-[#1a5276]" /> Obras en Ejecución
            </h2>
            <a href="/obras" className="text-xs text-[#1a5276] hover:underline font-medium">Ver todas →</a>
          </div>
          <div className="divide-y divide-gray-50">
            {obras.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">No hay obras activas</p>
            ) : obras.map((o: any) => {
              const avance = o.avance_porcentaje ?? 0;
              const pct = o.presupuesto_total > 0
                ? Math.round((o.total_gastos / o.presupuesto_total) * 100)
                : 0;
              return (
                <div key={o.id} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{o.nombre_obra}</p>
                      <p className="text-xs text-gray-400">{o.ciudad ?? ""}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={estadoObraVariant[o.estado] ?? "gray"}>
                        {o.estado?.replace("_", " ")}
                      </Badge>
                      <span className="text-xs font-bold text-[#1a5276]">{avance}%</span>
                    </div>
                  </div>
                  {/* Barra de avance */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                    <div
                      className="h-2 rounded-full bg-[#1a5276] transition-all"
                      style={{ width: `${avance}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Gastado: {formatPeso(o.total_gastos)}</span>
                    <span className={pct > 90 ? "text-red-500 font-semibold" : ""}>
                      {pct}% del presupuesto
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex flex-col gap-5">
          {/* Prospectos recientes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1a5276]" /> Prospectos Recientes
              </h2>
              <a href="/prospectos" className="text-xs text-[#1a5276] hover:underline font-medium">Ver todos →</a>
            </div>
            <div className="divide-y divide-gray-50">
              {prospectos.length === 0 ? (
                <p className="px-5 py-4 text-center text-gray-400 text-sm">Sin prospectos</p>
              ) : prospectos.slice(0, 4).map((p: any) => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.nombre}</p>
                    <p className="text-xs text-gray-400">{p.tipo_proyecto?.replace("_", " ")} · {p.fuente}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={estadoProspectoVariant[p.estado_crm] ?? "gray"} className="text-[10px]">
                      {p.estado_crm?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Alertas del Sistema
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {stockBajo.length > 0 && (
                <div className="px-5 py-3 flex items-center gap-3">
                  <Package className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{stockBajo.length} materiales bajo stock</p>
                    <a href="/inventario" className="text-xs text-[#1a5276] hover:underline">Ver inventario →</a>
                  </div>
                </div>
              )}
              {pagos.length > 0 && (
                <div className="px-5 py-3 flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{pagos.length} pagos próximos a vencer</p>
                    <a href="/finanzas" className="text-xs text-[#1a5276] hover:underline">Ver finanzas →</a>
                  </div>
                </div>
              )}
              {stockBajo.length === 0 && pagos.length === 0 && (
                <div className="px-5 py-4 flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" /> Todo en orden
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
