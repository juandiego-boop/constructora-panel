export const dynamic = "force-dynamic";

import { supabase, formatPeso, formatFecha } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Badge, { estadoPagoVariant } from "@/components/Badge";
import NuevoGastoBtn from "./NuevoGastoBtn";
import { DollarSign, TrendingDown, TrendingUp, AlertCircle, Calendar, Package } from "lucide-react";



async function getPagosProximos() {
  const { data } = await supabase
    .from("v_pagos_proximos")
    .select("*")
    .order("fecha_vencimiento", { ascending: true });
  return data ?? [];
}

async function getFlujoCaja() {
  const { data } = await supabase
    .from("v_flujo_caja_mensual")
    .select("*")
    .order("anio", { ascending: false })
    .order("mes", { ascending: false })
    .limit(6);
  return data ?? [];
}

async function getGastosRecientes() {
  const { data } = await supabase
    .from("gastos")
    .select("id, categoria, descripcion, valor, fecha_gasto, obra_id, proveedores(nombre)")
    .order("fecha_gasto", { ascending: false })
    .limit(15);
  return data ?? [];
}

async function getResumenFinanciero() {
  // Pagos: usar columna real "valor"
  const { data: pagos } = await supabase
    .from("pagos")
    .select("valor, estado");
  const total = (pagos ?? []).reduce((s: number, p: any) => s + (p.valor ?? 0), 0);
  const cobrado = (pagos ?? []).filter((p: any) => p.estado === "pagado").reduce((s: number, p: any) => s + (p.valor ?? 0), 0);
  const pendiente = total - cobrado;
  const vencidos = (pagos ?? []).filter((p: any) => p.estado === "vencido").length;
  return { total, cobrado, pendiente, vencidos };
}

async function getGastosPorCategoria() {
  const { data } = await supabase
    .from("gastos")
    .select("categoria, valor");
  const map: Record<string, number> = {};
  (data ?? []).forEach((g: any) => {
    const cat = g.categoria ?? "otros";
    map[cat] = (map[cat] ?? 0) + (g.valor ?? 0);
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
}

async function getGastosPorObra() {
  const { data } = await supabase
    .from("gastos")
    .select("obra_id, valor, obras(nombre)");
  const map: Record<string, { nombre: string; total: number }> = {};
  (data ?? []).forEach((g: any) => {
    const id = g.obra_id ?? "sin_obra";
    const nombre = g.obras?.nombre ?? "Sin obra";
    if (!map[id]) map[id] = { nombre, total: 0 };
    map[id].total += g.valor ?? 0;
  });
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
}

const MESES = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const CAT_COLORS: Record<string, string> = {
  mano_de_obra: "bg-blue-500",
  materiales: "bg-green-500",
  equipos: "bg-purple-500",
  subcontratos: "bg-orange-500",
  administrativo: "bg-gray-400",
  otros: "bg-gray-300",
};

export default async function FinanzasPage() {
  const [pagos, flujo, gastos, resumen, porCategoria, porObra] = await Promise.all([
    getPagosProximos(),
    getFlujoCaja(),
    getGastosRecientes(),
    getResumenFinanciero(),
    getGastosPorCategoria(),
    getGastosPorObra(),
  ]);

  const maxFlujo = Math.max(...flujo.map((f: any) => Math.max(f.total_ingresos ?? 0, f.total_egresos ?? 0)), 1);
  const maxCat = porCategoria.length > 0 ? porCategoria[0][1] : 1;

  return (
    <div>
      <PageHeader title="Finanzas" subtitle="Control de pagos, gastos y flujo de caja" action={<NuevoGastoBtn />} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Total Facturado</p>
          <p className="text-xl font-bold text-blue-800">{formatPeso(resumen.total)}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">Total Cobrado</p>
          <p className="text-xl font-bold text-green-800">{formatPeso(resumen.cobrado)}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-yellow-600 mb-1 uppercase tracking-wide">Por Cobrar</p>
          <p className="text-xl font-bold text-yellow-800">{formatPeso(resumen.pendiente)}</p>
        </div>
        <div className={`border rounded-xl p-4 ${resumen.vencidos > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
          <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${resumen.vencidos > 0 ? "text-red-600" : "text-gray-500"}`}>
            Pagos Vencidos
          </p>
          <p className={`text-xl font-bold ${resumen.vencidos > 0 ? "text-red-700" : "text-gray-700"}`}>
            {resumen.vencidos}
          </p>
        </div>
      </div>

      {/* Fila 1: Flujo + Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Flujo de caja */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1a5276]" />
            <h2 className="font-semibold text-gray-800">Flujo de Caja — Últimos 6 meses</h2>
          </div>
          <div className="p-5">
            {flujo.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Sin datos de flujo de caja</p>
            ) : (
              <div className="space-y-4">
                {[...flujo].reverse().map((f: any) => {
                  const pctIngreso = Math.round((f.total_ingresos ?? 0) / maxFlujo * 100);
                  const pctEgreso  = Math.round((f.total_egresos ?? 0) / maxFlujo * 100);
                  const neto = (f.flujo_neto ?? 0);
                  return (
                    <div key={`${f.anio}-${f.mes}`}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-gray-700">{MESES[f.mes]} {f.anio}</span>
                        <span className={`font-bold ${neto >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {neto >= 0 ? "+" : ""}{formatPeso(neto)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-green-600 w-14 text-right">{formatPeso(f.total_ingresos).replace("$", "")}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full bg-green-500" style={{ width: `${pctIngreso}%` }} />
                          </div>
                          <TrendingUp className="w-2.5 h-2.5 text-green-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-red-500 w-14 text-right">{formatPeso(f.total_egresos).replace("$", "")}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full bg-red-400" style={{ width: `${pctEgreso}%` }} />
                          </div>
                          <TrendingDown className="w-2.5 h-2.5 text-red-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pagos próximos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-gray-800">Pagos Próximos a Vencer</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pagos.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Sin pagos próximos</p>
            ) : pagos.map((p: any) => {
              const diasRestantes = p.dias_para_vencer ?? null;
              return (
                <div key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{p.concepto ?? p.descripcion ?? "—"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatFecha(p.fecha_vencimiento)}
                      </span>
                      {diasRestantes !== null && (
                        <span className={`text-xs font-semibold ${diasRestantes < 0 ? "text-red-600" : diasRestantes <= 3 ? "text-orange-500" : "text-gray-400"}`}>
                          {diasRestantes < 0 ? `VENCIDO (${Math.abs(diasRestantes)}d)` : `${diasRestantes}d`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-800 text-sm">{formatPeso(p.valor ?? p.saldo ?? 0)}</p>
                    <Badge variant={estadoPagoVariant[p.estado] ?? "gray"} className="text-[10px]">
                      {p.estado}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fila 2: Gastos por categoría + por obra */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Por categoría */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1a5276]" />
            <h2 className="font-semibold text-gray-800">Gastos por Categoría</h2>
          </div>
          <div className="p-5 space-y-3">
            {porCategoria.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">Sin datos</p>
            ) : porCategoria.map(([cat, total]) => {
              const pct = Math.round((total / maxCat) * 100);
              const color = CAT_COLORS[cat] ?? "bg-gray-400";
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600 capitalize">{cat.replace(/_/g, " ")}</span>
                    <span className="font-semibold text-gray-800">{formatPeso(total)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Por obra */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#1a5276]" />
            <h2 className="font-semibold text-gray-800">Gastos por Obra</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {porObra.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Sin datos</p>
            ) : porObra.map((o) => {
              const pct = Math.round((o.total / (porObra[0]?.total ?? 1)) * 100);
              return (
                <div key={o.nombre} className="px-5 py-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800 truncate">{o.nombre}</span>
                    <span className="font-semibold text-gray-800 ml-2 whitespace-nowrap">{formatPeso(o.total)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-[#1a5276]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gastos recientes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#1a5276]" />
          <h2 className="font-semibold text-gray-800">Gastos Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">Fecha</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {gastos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    Sin gastos registrados
                  </td>
                </tr>
              ) : gastos.map((g: any) => (
                <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatFecha(g.fecha_gasto)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="blue" className="capitalize text-[10px]">
                      {g.categoria?.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{g.descripcion}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{g.proveedores?.nombre ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    {formatPeso(g.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
