export const dynamic = "force-dynamic";

import { supabase, formatPeso, formatFecha } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Badge, { estadoPagoVariant } from "@/components/Badge";
import NuevoGastoBtn from "./NuevoGastoBtn";
import { DollarSign, TrendingDown, TrendingUp, AlertCircle, Calendar } from "lucide-react";



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
    .select("id, categoria, descripcion, monto, fecha_gasto, proveedor")
    .order("fecha_gasto", { ascending: false })
    .limit(10);
  return data ?? [];
}

async function getResumenFinanciero() {
  const { data: pagos } = await supabase
    .from("pagos")
    .select("monto, monto_pagado, estado");
  const total = (pagos ?? []).reduce((s: number, p: any) => s + (p.monto ?? 0), 0);
  const cobrado = (pagos ?? []).reduce((s: number, p: any) => s + (p.monto_pagado ?? 0), 0);
  const pendiente = total - cobrado;
  const vencidos = (pagos ?? []).filter((p: any) => p.estado === "vencido").length;
  return { total, cobrado, pendiente, vencidos };
}

const MESES = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default async function FinanzasPage() {
  const [pagos, flujo, gastos, resumen] = await Promise.all([
    getPagosProximos(),
    getFlujoCaja(),
    getGastosRecientes(),
    getResumenFinanciero(),
  ]);

  const maxFlujo = Math.max(...flujo.map((f: any) => Math.abs(f.flujo_neto ?? 0)), 1);

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
              <div className="space-y-3">
                {[...flujo].reverse().map((f: any) => {
                  const pct = Math.abs(f.flujo_neto ?? 0) / maxFlujo * 100;
                  const positivo = (f.flujo_neto ?? 0) >= 0;
                  return (
                    <div key={`${f.anio}-${f.mes}`}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-600">{MESES[f.mes]} {f.anio}</span>
                        <span className={`font-bold ${positivo ? "text-green-600" : "text-red-600"}`}>
                          {positivo ? "+" : ""}{formatPeso(f.flujo_neto)}
                        </span>
                      </div>
                      <div className="flex gap-1 items-center">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${positivo ? "bg-green-500" : "bg-red-400"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5 text-green-500" />{formatPeso(f.total_ingresos)}</span>
                        <span className="flex items-center gap-1"><TrendingDown className="w-2.5 h-2.5 text-red-400" />{formatPeso(f.total_egresos)}</span>
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
              const saldo = (p.monto ?? 0) - (p.monto_pagado ?? 0);
              const diasRestantes = p.fecha_vencimiento
                ? Math.ceil((new Date(p.fecha_vencimiento).getTime() - Date.now()) / 86400000)
                : null;
              return (
                <div key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{p.concepto}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatFecha(p.fecha_vencimiento)}
                      </span>
                      {diasRestantes !== null && (
                        <span className={`text-xs font-medium ${diasRestantes <= 3 ? "text-red-600" : diasRestantes <= 7 ? "text-orange-500" : "text-gray-400"}`}>
                          {diasRestantes <= 0 ? "VENCIDO" : `${diasRestantes}d`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-800 text-sm">{formatPeso(saldo)}</p>
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
                <th className="px-4 py-3 text-right">Monto</th>
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
                    <Badge variant="blue" className="capitalize">
                      {g.categoria?.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{g.descripcion}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{g.proveedor ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                    {formatPeso(g.monto)}
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
