export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { obra_id, categoria, descripcion, monto, fecha_gasto, proveedor } = body;

    if (!descripcion || !monto || !fecha_gasto || !categoria) {
      return NextResponse.json({ error: "Faltan campos requeridos: categoria, descripcion, monto, fecha_gasto" }, { status: 400 });
    }

    const insert: Record<string, unknown> = {
      categoria,
      descripcion,
      monto: Number(monto),
      fecha_gasto,
    };
    if (obra_id)   insert.obra_id   = obra_id;
    if (proveedor) insert.proveedor = proveedor;

    const { data, error } = await supabase.from("gastos").insert([insert]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
