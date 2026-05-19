export const dynamic = "force-dynamic";

import { supabase, formatFecha } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import NuevaTareaBtn from "./NuevaTareaBtn";
import { ClipboardList, AlertCircle, Clock } from "lucide-react";



async function getTareas() {
  const { data } = await supabase
    .from("tareas")
    .select("*, obras(nombre_obra)")
    .not("estado", "eq", "completada")
    .order("fecha_vencimiento", { ascending: true })
    .limit(50);
  return data ?? [];
}

async function getTareasVencidas() {
  const { data } = await supabase.from("v_tareas_vencidas").select("*");
  return data ?? [];
}

const ESTADO_VARIANT: Record<string, any> = {
  pendiente: "yellow",
  en_progreso: "blue",
  bloqueada: "red",
  completada: "green",
};

const PRIORIDAD_VARIANT: Record<string, any> = {
  critica: "red",
  alta: "orange",
  media: "yellow",
  baja: "gray",
};

export default async function TareasPage() {
  const [tareas, vencidas] = await Promise.all([getTareas(), getTareasVencidas()]);

  const completadas = tareas.filter((t: any) => t.estado === "completada").length;
  const enProgreso = tareas.filter((t: any) => t.estado === "en_progreso").length;
  const bloqueadas = tareas.filter((t: any) => t.estado === "bloqueada").length;

  return (
    <div>
      <PageHeader
        title="Tareas"
        subtitle={`${tareas.length} pendientes · ${vencidas.length} vencidas · ${enProgreso} en progreso`}
        action={<NuevaTareaBtn />}
      />

      {/* Vencidas banner */}
      {vencidas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">{vencidas.length} tarea(s) vencida(s)</p>
            <p className="text-sm text-red-600">Revisa y actualiza el estado de estas tareas.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total activas", value: tareas.length, color: "bg-blue-50 border-blue-100 text-blue-800" },
          { label: "En progreso", value: enProgreso, color: "bg-yellow-50 border-yellow-100 text-yellow-800" },
          { label: "Vencidas", value: vencidas.length, color: "bg-red-50 border-red-100 text-red-700" },
          { label: "Bloqueadas", value: bloqueadas, color: "bg-orange-50 border-orange-100 text-orange-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-lg border p-3 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de tareas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Tarea</th>
                <th className="px-4 py-3.5">Obra</th>
                <th className="px-4 py-3.5">Responsable</th>
                <th className="px-4 py-3.5">Vencimiento</th>
                <th className="px-4 py-3.5">Prioridad</th>
                <th className="px-4 py-3.5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tareas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                    No hay tareas activas. ¡Buen trabajo!
                  </td>
                </tr>
              ) : tareas.map((t: any) => {
                const hoy = new Date();
                const vence = t.fecha_vencimiento ? new Date(t.fecha_vencimiento) : null;
                const vencida = vence && vence < hoy && t.estado !== "completada";
                const diasRestantes = vence
                  ? Math.ceil((vence.getTime() - hoy.getTime()) / 86400000)
                  : null;

                return (
                  <tr key={t.id} className={`hover:bg-gray-50/50 transition-colors ${vencida ? "bg-red-50/30" : ""}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{t.titulo}</p>
                      {t.descripcion && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{t.descripcion}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs">
                      {t.obras?.nombre_obra ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">
                      {t.responsable ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      {vence ? (
                        <div>
                          <p className={`text-xs font-medium ${vencida ? "text-red-600" : diasRestantes! <= 3 ? "text-orange-500" : "text-gray-500"}`}>
                            {formatFecha(t.fecha_vencimiento)}
                          </p>
                          {diasRestantes !== null && (
                            <p className={`text-[10px] ${vencida ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                              {vencida ? `Vencida hace ${Math.abs(diasRestantes)}d` : `${diasRestantes}d restantes`}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={PRIORIDAD_VARIANT[t.prioridad] ?? "gray"} className="capitalize">
                        {t.prioridad ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={ESTADO_VARIANT[t.estado] ?? "gray"} className="capitalize">
                        {t.estado?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
