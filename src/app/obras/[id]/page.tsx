export const dynamic = "force-dynamic";

import { supabase, formatPeso, formatFecha } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Badge, { estadoObraVariant } from "@/components/Badge";
import ObraActionsBtn from "../ObraActionsBtn";
import { notFound } from "next/navigation";
import {
  HardHat, MapPin, Calendar, TrendingUp, AlertTriangle,
  DollarSign, CheckSquare, Package, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const ESTADO_LABELS: Record<string, string> = {
  planificacion: "Planificación",
  en_ejecucion:  "En ejecución",
  pausada:       "En pausa",
  finalizada:    "Finalizada",
  cancelada:     "Cancelada",
};

const ESTADO_TAREA: Record<string, string> = {
  pendiente:   "Pendiente",
  en_progreso: "En progreso",
  completada:  "Completada",
  bloqueada:   "Bloqueada",
};

const TAREA_COLOR: Record<string, string> = {
  pendiente:   "bg-gray-100 text-gray-600",
  en_progreso: "bg-blue-100 text-blue-700",
  completada:  "bg-green-100 text-green-700",
  bloqueada:   "bg-red-100 text-red-700",
};

async function getObra(id: string) {
  // Lee directamente de la tabla obras — no depende de vistas que filtran por cliente
  const { data, error } = await supabase
    .from("obras")
    .select(
      "id, codigo_obra, nombre, estado, avance_porcentaje, presupuesto_total, " +
      "ciudad, direccion, fecha_inicio_plan, fecha_fin_plan, tipo_obra, descripcion, created_at"
    )
    .eq("id", id)
    .single();
  if (error) console.error("[obras/[id]] getObra error:", error.message);
  return data;
}

async function getCostoEjecutado(obraId: string): Promise<number> {
  const { data } = await supabase
    .from("gastos")
    .select("valor")
    .eq("obra_id", obraId);
  return (data ?? []).reduce((s: number, g: any) => s + (g.valor ?? 0), 0);
}

async function getTareas(obraId: string) {
  const { data } = await supabase
    .from("tareas")
    .select("id, nombre, descripcion, estado, prioridad, fecha_inicio_plan, fecha_fin_plan, porcentaje_avance")
    .eq("obra_id", obraId)
    .order("fecha_fin_plan", { ascending: true });
  return data ?? [];
}

async function getGastos(obraId: string) {
  const { data } = await supabase
    .from("gastos")
    .select("id, categoria, descripcion, valor, fecha_gasto")
    .eq("obra_id", obraId)
    .order("fecha_gasto", { ascending: false })
    .limit(20);
  return data ?? [];
}

type Props = { params: { id: string } };

export default async function ObraDetallePage({ params }: Props) {
  const [obra, tareas, gastos, costoEjecutado] = await Promise.all([
    getObra(params.id),
    getTareas(params.id),
    getGastos(params.id),
    getCostoEjecutado(params.id),
  ]);

  if (!obra) notFound();

  const avance      = obra.avance_porcentaje ?? 0;
  const presupuesto = obra.presupuesto_total ?? 0;
  const gastado     = costoEjecutado;
  const pctGasto    = presupuesto > 0 ? Math.round((gastado / presupuesto) * 100) : 0;
  const enRiesgo    = pctGasto > 90 && avance < 90;

  const tareasCompletadas = tareas.filter((t: any) => t.estado === "completada").length;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link href="/obras" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1a5276] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a Obras
        </Link>
      </div>

      <PageHeader
        title={obra.nombre}
        subtitle={[obra.ciudad, obra.codigo_obra].filter(Boolean).join(" · ")}
        action={
          <ObraActionsBtn
            obraId={obra.id}
            obraEstado={obra.estado}
            obraAvance={avance}
            obraData={obra}
          />
        }
      />

      {/* Estado + alertas */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={estadoObraVariant[obra.estado] ?? "gray"} className="text-sm px-3 py-1">
          {ESTADO_LABELS[obra.estado] ?? obra.estado}
        </Badge>
        {enRiesgo && (
          <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
            <AlertTriangle className="w-4 h-4" /> Presupuesto en riesgo
          </span>
        )}
      </div>

      {/* Descripción */}
      {obra.descripcion && (
        <p className="text-sm text-gray-500 mb-5 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
          {obra.descripcion}
        </p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Avance físico</p>
          <p className="text-2xl font-bold text-[#1a5276]">{avance}%</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full bg-[#1a5276]" style={{ width: `${avance}%` }} />
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Ejecución presup.</p>
          <p className={`text-2xl font-bold ${pctGasto > 90 ? "text-red-600" : "text-gray-800"}`}>{pctGasto}%</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${pctGasto > 90 ? "bg-red-500" : pctGasto > 75 ? "bg-yellow-500" : "bg-green-500"}`}
              style={{ width: `${Math.min(pctGasto, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Presupuesto</p>
          <p className="text-lg font-bold text-gray-800">{formatPeso(presupuesto)}</p>
          <p className="text-xs text-gray-400 mt-1">Gastado: {formatPeso(gastado)}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Tareas</p>
          <p className="text-2xl font-bold text-gray-800">{tareasCompletadas}/{tareas.length}</p>
          <p className="text-xs text-gray-400 mt-1">completadas</p>
        </div>
      </div>

      {/* Fechas */}
      {(obra.fecha_inicio_plan || obra.fecha_fin_plan) && (
        <div className="flex gap-6 mb-6 text-sm text-gray-500">
          {obra.fecha_inicio_plan && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1a5276]" />
              Inicio: <strong>{formatFecha(obra.fecha_inicio_plan)}</strong>
            </span>
          )}
          {obra.fecha_fin_plan && (
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Fin estimado: <strong>{formatFecha(obra.fecha_fin_plan)}</strong>
            </span>
          )}
          {obra.ciudad && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              {obra.ciudad}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#1a5276]" />
            <h2 className="font-semibold text-gray-800">Tareas</h2>
            <span className="ml-auto text-xs text-gray-400">{tareasCompletadas}/{tareas.length}</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {tareas.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Sin tareas registradas</p>
            ) : tareas.map((t: any) => (
              <div key={t.id} className="px-5 py-3.5 flex items-start gap-3">
                <span className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${TAREA_COLOR[t.estado] ?? "bg-gray-100 text-gray-600"}`}>
                  {ESTADO_TAREA[t.estado] ?? t.estado}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{t.nombre}</p>
                  {t.fecha_fin_plan && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      <Calendar className="w-3 h-3 inline mr-0.5" /> {formatFecha(t.fecha_fin_plan)}
                    </p>
                  )}
                </div>
                {t.prioridad && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    t.prioridad === "alta" || t.prioridad === "critica"
                      ? "bg-red-100 text-red-600"
                      : t.prioridad === "media"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {t.prioridad}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Gastos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#1a5276]" />
            <h2 className="font-semibold text-gray-800">Gastos recientes</h2>
            <span className="ml-auto text-xs font-semibold text-gray-700">{formatPeso(gastado)}</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {gastos.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Sin gastos registrados</p>
            ) : gastos.map((g: any) => (
              <div key={g.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{g.descripcion}</p>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium capitalize">
                    {g.categoria?.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{formatPeso(g.valor)}</p>
                  <p className="text-xs text-gray-400">{formatFecha(g.fecha_gasto)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
    }
