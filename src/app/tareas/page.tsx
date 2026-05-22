export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import NuevaTareaBtn from "./NuevaTareaBtn";
import FiltrosTareas from "./FiltrosTareas";
import { AlertCircle } from "lucide-react";

async function getTareas() {
  const { data } = await supabase
    .from("tareas")
    .select("id, nombre, descripcion, estado, prioridad, fecha_fin_plan, porcentaje_avance, obra_id, obras(nombre, codigo_obra)")
    .order("fecha_fin_plan", { ascending: true, nullsFirst: false })
    .limit(200);
  return data ?? [];
}

async function getVencidasIds() {
  const { data } = await supabase.from("v_tareas_vencidas").select("id");
  return (data ?? []).map((v: any) => v.id as string);
}

export default async function TareasPage() {
  const [tareas, vencidasIds] = await Promise.all([getTareas(), getVencidasIds()]);

  const activas    = tareas.filter((t: any) => t.estado !== "completada");
  const completadas = tareas.filter((t: any) => t.estado === "completada");
  const enProgreso = tareas.filter((t: any) => t.estado === "en_progreso");
  const pendientes = tareas.filter((t: any) => t.estado === "pendiente");
  const bloqueadas = tareas.filter((t: any) => t.estado === "bloqueada");

  return (
    <div>
      <PageHeader
        title="Tareas"
        subtitle={`${activas.length} activas · ${vencidasIds.length} vencidas · ${completadas.length} completadas`}
        action={<NuevaTareaBtn />}
      />

      {/* Banner vencidas */}
      {vencidasIds.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">{vencidasIds.length} tarea(s) vencida(s)</p>
            <p className="text-sm text-red-600">Usa el filtro "Vencidas" para verlas y actualizarlas.</p>
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

      {/* Tabla con filtros interactivos */}
      <FiltrosTareas tareas={tareas as any} vencidasIds={vencidasIds} />
    </div>
  );
}
