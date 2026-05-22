export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from("obras")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      estado,
      avance_porcentaje,
      nombre,
      ciudad,
      direccion,
      tipo_obra,
      descripcion,
      codigo_obra,
      presupuesto_total,
      // Accept both naming conventions
      fecha_inicio_plan,
      fecha_fin_plan,
      fecha_inicio,
      fecha_fin_estimada,
    } = body;

    const update: Record<string, unknown> = {};

    if (estado !== undefined)            update.estado            = estado;
    if (nombre !== undefined)            update.nombre            = nombre;
    if (ciudad !== undefined)            update.ciudad            = ciudad;
    if (direccion !== undefined)         update.direccion         = direccion;
    if (tipo_obra !== undefined)         update.tipo_obra         = tipo_obra;
    if (descripcion !== undefined)       update.descripcion       = descripcion;
    if (codigo_obra !== undefined)       update.codigo_obra       = codigo_obra;
    if (avance_porcentaje !== undefined) update.avance_porcentaje = Number(avance_porcentaje);
    if (presupuesto_total !== undefined) update.presupuesto_total = Number(presupuesto_total);

    // Accept both fecha_inicio_plan/fecha_inicio and fecha_fin_plan/fecha_fin_estimada
    const fi = fecha_inicio_plan ?? fecha_inicio;
    const ff = fecha_fin_plan    ?? fecha_fin_estimada;
    if (fi !== undefined) update.fecha_inicio_plan = fi || null;
    if (ff !== undefined) update.fecha_fin_plan    = ff || null;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("obras")
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

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from("obras")
      .delete()
      .eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
