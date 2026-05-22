export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type Params = { params: { id: string } };

// PATCH — actualizar gasto
export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { categoria, descripcion, monto, valor, fecha_gasto, notas, estado } = body;

    const update: Record<string, unknown> = {};
    if (categoria)   update.categoria   = categoria;
    if (descripcion) update.descripcion = descripcion;
    if (fecha_gasto) update.fecha_gasto = fecha_gasto;
    if (notas !== undefined) update.notas = notas;
    if (estado)      update.estado      = estado;
    const montoVal = Number(monto ?? valor ?? 0);
    if (montoVal > 0) update.valor = montoVal;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("gastos")
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

// DELETE — eliminar gasto
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { error } = await supabase.from("gastos").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
