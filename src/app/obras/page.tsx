export const dynamic = "force-dynamic";

import { supabase, formatPeso, formatFecha } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Badge, { estadoObraVariant } from "@/components/Badge";
import NuevaObraBtn from "./NuevaObraBtn";
import ObraActionsBtn from "./ObraActionsBtn";
import ObrasFilterTabs from "./ObrasFilterTabs";
import { HardHat, MapPin, Calendar, TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

async function getObras(estado?: string) {
  let query = supabase
    .from("v_dashboard_obras")
    .select("*")
    .order("nombre", { ascending: true });
  if (estado) query = (query as any).eq("estado", estado);
  const { data } = await query;
  return data ?? [];
}

async function getUtilidadObras() {
  const { data } = await supabase.from("v_utilidad_obras").select("*");
  const map: Record<string, any> = {};
  (data ?? []).forEach((u: any) => { map[u.obra_id ?? u.nombre_obra] = u; });
  return map;
}

const ESTADO_LABELS: Record<string, string> = {
  planificacion: "Planificación",
  en_ejecucion: "En ejecución",
  pausada: "En pausa",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

type Props = { searchParams: { estado?: string } };

export default async function ObrasPage({ searchParams }: Props) {
  const estadoFilter = searchParams.estado;
  const [obras, utilidades] = await Promise.all([getObras(estadoFilter), getUtilidadObras()]);

  // Totales siempre sobre todas las obras
  const [todasObras] = await Promise.all([getObras()]);
  const activas     = todasObras.filter((o: any) => o.estado === "en_ejecucion").length;
  const enPausa     = todasObras.filter((o: any) => o.estado === "pausada").length;
  const finalizadas = todasObras.filter((o: any) => o.estado === "finalizada").length;
  const presupuestoTotal = todasObras.reduce((s: number, o: any) => s + (o.presupuesto_total ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Obras"
        subtitle={`${todasObras.length} obras registradas · ${activas} en ejecución`}
        action={<NuevaObraBtn />}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "En ejecución", value: activas, color: "bg-green-50 border-green-100 text-green-800" },
          { label: "En pausa", value: enPausa, color: "bg-yellow-50 border-yellow-100 text-yellow-800" },
          { label: "Finalizadas", value: finalizadas, color: "bg-gray-50 border-gray-200 text-gray-700" },
          { label: "Presupuesto total", value: formatPeso(presupuestoTotal), color: "bg-blue-50 border-blue-100 text-blue-800" },
        ].map(s => (
          <div key={s.label} className={`rounded-lg border p-3 ${s.color}`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <Suspense fallback={null}>
        <ObrasFilterTabs />
      </Suspense>

      {/* Cards de obras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {obras.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            No hay obras en este estado.
          </div>
        ) : obras.map((o: any) => {
          const avance = o.avance_porcentaje ?? 0;
          const gastado = o.costo_ejecutado ?? 0;
          const presupuesto = o.presupuesto_total ?? 0;
          const pctGasto = presupuesto > 0 ? Math.round((gastado / presupuesto) * 100) : 0;
          const enRiesgo = pctGasto > 90 && avance < 90;
          const utilidad = utilidades[o.id] ?? utilidades[o.nombre];

          return (
            <div key={o.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${enRiesgo ? "border-red-200" : "border-gray-100"}`}>
              {/* Header de la card */}
              <div className="px-5 py-4 border-b border-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-[#1a5276]" />
                      <Link href={`/obras/${o.id}`} className="font-semibold text-gray-900 hover:text-[#1a5276] hover:underline transition-colors">
                        {o.nombre}
                      </Link>
                      {enRiesgo && (
                        <AlertTriangle className="w-4 h-4 text-red-500" aria-label="Presupuesto en riesgo" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {o.ciudad && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{o.ciudad}</span>}
                      {o.codigo_obra && <span className="font-mono">{o.codigo_obra}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={estadoObraVariant[o.estado] ?? "gray"}>
                      {ESTADO_LABELS[o.estado] ?? o.estado}
                    </Badge>
                    <ObraActionsBtn
                      obraId={o.id}
                      obraEstado={o.estado}
                      obraAvance={o.avance_porcentaje ?? 0}
                    />
                  </div>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="px-5 py-4 space-y-4">
                {/* Barra de avance físico */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium">Avance físico</span>
                    <span className="font-bold text-[#1a5276]">{avance}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-[#1a5276] transition-all"
                      style={{ width: `${avance}%` }}
                    />
                  </div>
                </div>

                {/* Barra presupuestal */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium">Ejecución presupuestal</span>
                    <span className={`font-bold ${pctGasto > 90 ? "text-red-600" : "text-gray-700"}`}>{pctGasto}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${pctGasto > 90 ? "bg-red-500" : pctGasto > 75 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(pctGasto, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Cifras */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 mb-0.5">Presupuesto</p>
                    <p className="text-sm font-semibold text-gray-800">{formatPeso(presupuesto)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 mb-0.5">Gastado</p>
                    <p className={`text-sm font-semibold ${enRiesgo ? "text-red-600" : "text-gray-800"}`}>{formatPeso(gastado)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 mb-0.5">Margen est.</p>
                    <p className="text-sm font-semibold text-green-700">
                      {utilidad?.margen_porcentaje != null ? `${utilidad.margen_porcentaje}%` : "—"}
                    </p>
                  </div>
                </div>

                {/* Fechas + link detalle */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-xs text-gray-400">
                    {o.fecha_inicio && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Inicio: {formatFecha(o.fecha_inicio)}
                      </span>
                    )}
                    {o.fecha_fin_estimada && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Est. fin: {formatFecha(o.fecha_fin_estimada)}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/obras/${o.id}`}
                    className="flex items-center gap-1 text-xs text-[#1a5276] hover:underline font-medium"
                  >
                    Ver detalle <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
