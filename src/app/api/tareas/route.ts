export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Acepta "nombre" o "titulo" para compatibilidad con el formulario
    const { obra_id, titulo, nombre, descripcion, fecha_vencimiento, fecha_fin_plan, prioridad, estado, porcentaje_avance } = body;

    const nombreFinal = nombre || titulo;
    if (!nombreFinal) {
      return NextResponse.json({ error: "El nombre/titulo es requerido" }, { status: 400 });
    }

    const insert: Record<string, unknown> = {
      nombre:    nombreFinal,                    // columna real: "nombre"
      estado:    estado    || "pendiente",
      prioridad: prioridad || "media",
      porcentaje_avance: Number(porcentaje_avance ?? 0),
    };
    if (obra_id)                           insert.obra_id         = obra_id;
    if (descripcion)                       insert.descripcion     = descripcion;
    // Acepta fecha_fin_plan o fecha_vencimiento (del formulario anterior)
    const fechaFin = fecha_fin_plan || fecha_vencimiento;
    if (fechaFin)                          insert.fecha_fin_plan  = fechaFin;

    const { data, error } = await supabase.from("tareas").insert([insert]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
