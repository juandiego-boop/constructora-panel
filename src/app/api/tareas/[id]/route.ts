export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type Params = { params: { id: string } };

// PATCH — actualizar estado, prioridad, avance, etc.
export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { estado, prioridad, porcentaje_avance, nombre, descripcion, fecha_fin_plan } = body;

    const update: Record<string, unknown> = {};
    if (estado !== undefined)             update.estado             = estado;
    if (prioridad !== undefined)          update.prioridad          = prioridad;
    if (porcentaje_avance !== undefined)  update.porcentaje_avance  = Number(porcentaje_avance);
    if (nombre !== undefined)             update.nombre             = nombre;
    if (descripcion !== undefined)        update.descripcion        = descripcion;
    if (fecha_fin_plan !== undefined)     update.fecha_fin_plan     = fecha_fin_plan;

    // Si se marca como completada, registrar fecha real
    if (estado === "completada") update.fecha_fin_real = new Date().toISOString().split("T")[0];

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tareas")
      .update(update)
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE — eliminar tarea
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { error } = await supabase.from("tareas").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
