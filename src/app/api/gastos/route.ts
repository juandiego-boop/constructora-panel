export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Schema real gastos: id, obra_id, categoria, descripcion, valor, fecha_gasto,
//   proveedor_id (UUID FK), estado, notas, created_at, updated_at

export async function GET() {
  const { data, error } = await supabase
    .from("gastos")
    .select("id, categoria, descripcion, valor, fecha_gasto, estado, obra_id, obras(nombre)")
    .order("fecha_gasto", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // "monto" viene del formulario, se guarda como "valor" en DB
    const { obra_id, categoria, descripcion, monto, valor, fecha_gasto, notas } = body;

    const montoFinal = Number(monto ?? valor ?? 0);
    if (!descripcion || !montoFinal || !fecha_gasto || !categoria) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: categoria, descripcion, monto, fecha_gasto" },
        { status: 400 }
      );
    }

    const insert: Record<string, unknown> = {
      categoria,
      descripcion,
      valor:      montoFinal,   // columna real en DB
      fecha_gasto,
      estado:     "pendiente",  // default
    };
    if (obra_id) insert.obra_id = obra_id;
    if (notas)   insert.notas   = notas;
    // Nota: proveedor_id es FK UUID — no soportado en formulario simple aún

    const { data, error } = await supabase.from("gastos").insert([insert]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
