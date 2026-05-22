export const dynamic = "force-dynamic";

import { supabase, formatFecha } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import NuevaTareaBtn from "./NuevaTareaBtn";
import AccionesTareaBtn from "./AccionesTareaBtn";
import { AlertCircle } from "lucide-react";

async function getTareas() {
  const { data } = await supabase
    .from("tareas")
    .select("id, nombre, descripcion, estado, prioridad, fecha_fin_plan, porcentaje_avance, obra_id, obras(nombre, codigo_obra)")
    .order("fecha_fin_plan", { ascending: true, nullsFirst: false })
    .limit(100);
  return data ?? [];
}

async function getTareasVencidas() {
  const { data } = await supabase.from("v_tareas_vencidas").select("id");
  return data ?? [];
}

const ESTADO_VARIANT: Record<string, string> = {
  pendiente:   "yellow",
  en_progreso: "blue",
  bloqueada:   "red",
  completada:  "green",
};

const PRIORIDAD_VARIANT: Record<string, string> = {
  critica: "red",
  alta:    "orange",
  media:   "yellow",
  baja:    "gray",
};

const PRIORIDAD_ORDER: Record<string, number> = {
  critica: 0, alta: 1, media: 2, baja: 3,
};

export default async function TareasPage() {
  const [tareas, vencidas] = await Promise.all([getTareas(), getTareasVencidas()]);
  const vencidasIds = new Set(vencidas.map((v: any) => v.id));

  const activas     = tareas.filter((t: any) => t.estado !== "completada");
  const completadas = tareas.filter((t: any) => t.estado === "completada");
  const enProgreso  = tareas.filter((t: any) => t.estado === "en_progreso");
  const bloqueadas  = tareas.filter((t: any) => t.estado === "bloqueada");
  const pendientes  = tareas.filter((t: any) => t.estado === "pendiente");

  // Ordenar: críticas primero, luego por fecha
  const tareasOrdenadas = [...activas].sort((a: any, b: any) => {
    const pa = PRIORIDAD_ORDER[a.prioridad] ?? 9;
    const pb = PRIORIDAD_ORDER[b.prioridad] ?? 9;
    if (pa !== pb) return pa - pb;
    if (!a.fecha_fin_plan) return 1;
    if (!b.fecha_fin_plan) return -1;
    return new Date(a.fecha_fin_plan).getTime() - new Date(b.fecha_fin_plan).getTime();
  });

  return (
    <div>
      <PageHeader
        title="Tareas"
        subtitle={`${activas.length} activas · ${vencidas.length} vencidas · ${completadas.length} completadas`}
        action={<NuevaTareaBtn />}
      />

      {/* Banner vencidas */}
      {vencidas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">{vencidas.length} tarea(s) vencida(s)</p>
            <p className="text-sm text-red-600">Actualiza su estado o extiende la fecha de vencimiento.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pendientes",  value: pendientes.length,  color: "bg-yellow-50 border-yellow-100 text-yellow-800" },
          { label: "En progreso", value: enProgreso.length,  color: "bg-blue-50 border-blue-100 text-blue-800"       },
          { label: "Bloqueadas",  value: bloqueadas.length,  color: "bg-red-50 border-red-100 text-red-700"          },
          { label: "Completadas", value: completadas.length, color: "bg-green-50 border-green-100 text-green-700"    },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla tareas activas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">Tareas activas</h2>
          <span className="text-xs text-gray-400">{tareasOrdenadas.length} tareas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">Tarea</th>
                <th className="px-4 py-3">Obra</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Avance</th>
                <th className="px-4 py-3">Prioridad</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tareasOrdenadas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                    No hay tareas activas. ¡Buen trabajo!
                  </td>
                </tr>
              ) : tareasOrdenadas.map((t: any) => {
                const hoy       = new Date();
                const vence     = t.fecha_fin_plan ? new Date(t.fecha_fin_plan + "T00:00:00") : null;
                const vencida   = vencidasIds.has(t.id);
                const diasRest  = vence ? Math.ceil((vence.getTime() - hoy.getTime()) / 86400000) : null;
                const avance    = t.porcentaje_avance ?? 0;

                return (
                  <tr key={t.id} className={`hover:bg-gray-50/60 transition-colors ${vencida ? "bg-red-50/20" : ""}`}>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className={`font-medium ${vencida ? "text-red-700" : "text-gray-900"}`}>{t.nombre}</p>
                      {t.descripcion && (
                        <p className="text-xs text-gray-400 truncate">{t.descripcion}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {t.obras ? (
                        <span>
                          {t.obras.codigo_obra ? <span className="font-mono text-gray-400">[{t.obras.codigo_obra}]</span> : null}
                          {" "}{t.obras.nombre}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      {vence ? (
                        <div>
                          <p className={`text-xs font-medium ${vencida ? "text-red-600" : diasRest! <= 3 ? "text-orange-500" : "text-gray-500"}`}>
                            {formatFecha(t.fecha_fin_plan)}
                          </p>
                          <p className={`text-[10px] ${vencida ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                            {vencida ? `Vencida hace ${Math.abs(diasRest!)}d` : `${diasRest}d restantes`}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${avance >= 100 ? "bg-green-500" : avance >= 50 ? "bg-blue-500" : "bg-yellow-400"}`}
                            style={{ width: `${avance}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{avance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={PRIORIDAD_VARIANT[t.prioridad] ?? "gray"} className="capitalize text-[11px]">
                        {t.prioridad ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={ESTADO_VARIANT[t.estado] ?? "gray"} className="capitalize text-[11px]">
                        {t.estado?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <AccionesTareaBtn tareaId={t.id} estadoActual={t.estado} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla completadas (colapsada) */}
      {completadas.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden opacity-70">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-600 text-sm flex items-center gap-2">
              ✓ Completadas
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{completadas.length}</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {completadas.slice(0, 10).map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-5 py-3 max-w-xs">
                      <p className="text-gray-400 line-through text-sm">{t.nombre}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{t.obras?.nombre ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="green" className="text-[11px]">Completada</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <AccionesTareaBtn tareaId={t.id} estadoActual={t.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
