export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Schema prospectos: nombre, email, telefono, whatsapp, ciudad, departamento,
// presupuesto_estimado, tipo_proyecto, fuente, estado_crm, score_ia, categoria_ia,
// responsable_id (UUID), fecha_primer_contacto, fecha_ultimo_seguimiento,
// notas_seguimiento, convertido_cliente_id (UUID)

export async function GET() {
  const { data, error } = await supabase
    .from("prospectos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre, email, telefono, whatsapp, ciudad, departamento,
      tipo_proyecto, fuente, presupuesto_estimado,
      notas, notas_seguimiento, estado_crm,
    } = body;

    if (!nombre || !telefono) {
      return NextResponse.json(
        { error: "Campos requeridos: nombre, telefono" },
        { status: 400 }
      );
    }

    const insert: Record<string, unknown> = {
      nombre,
      telefono,
      estado_crm:            estado_crm || "nuevo",
      fecha_primer_contacto: new Date().toISOString().split("T")[0],
    };

    if (email)       insert.email       = email;
    if (whatsapp)    insert.whatsapp    = whatsapp;
    if (ciudad)      insert.ciudad      = ciudad;
    if (departamento) insert.departamento = departamento;
    if (tipo_proyecto) insert.tipo_proyecto = tipo_proyecto;
    if (fuente)      insert.fuente      = fuente;
    if (presupuesto_estimado) insert.presupuesto_estimado = Number(presupuesto_estimado);

    const notasFinal = notas_seguimiento || notas;
    if (notasFinal)  insert.notas_seguimiento = notasFinal;

    const { data, error } = await supabase
      .from("prospectos")
      .insert([insert])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
