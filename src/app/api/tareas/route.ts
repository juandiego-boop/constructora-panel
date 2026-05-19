export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { obra_id, titulo, descripcion, responsable, fecha_vencimiento, prioridad, estado } = body;

    if (!titulo) {
      return NextResponse.json({ error: "El titulo es requerido" }, { status: 400 });
    }

    const insert: Record<string, unknown> = {
      titulo,
      estado:   estado   || "pendiente",
      prioridad: prioridad || "media",
    };
    if (obra_id)          insert.obra_id          = obra_id;
    if (descripcion)      insert.descripcion      = descripcion;
    if (responsable)      insert.responsable      = responsable;
    if (fecha_vencimiento) insert.fecha_vencimiento = fecha_vencimiento;

    const { data, error } = await supabase.from("tareas").insert([insert]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
