export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Schema real obras: codigo_obra (NOT NULL), nombre, estado, ciudad,
// fecha_inicio_plan, fecha_fin_plan, presupuesto_total, avance_porcentaje, tipo_obra

function generarCodigo(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `OB-${year}-${rand}`;
}

export async function GET() {
  const { data, error } = await supabase
    .from("obras")
    .select("id, nombre, codigo_obra")
    .not("estado", "eq", "cancelada")
    .order("nombre");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre_obra, nombre, codigo_obra,
      ciudad, direccion, estado, tipo_obra,
      presupuesto_total, fecha_inicio, fecha_inicio_plan,
      fecha_fin_estimada, fecha_fin_plan,
    } = body;

    const obra_nombre = nombre || nombre_obra;
    if (!obra_nombre) {
      return NextResponse.json({ error: "nombre es requerido" }, { status: 400 });
    }

    const insert: Record<string, unknown> = {
      nombre:           obra_nombre,
      codigo_obra:      codigo_obra || generarCodigo(), // NOT NULL — auto-genera si no viene
      estado:           estado || "planificacion",
      avance_porcentaje: 0,
    };

    if (ciudad)            insert.ciudad           = ciudad;
    if (direccion)         insert.direccion        = direccion;
    if (tipo_obra)         insert.tipo_obra        = tipo_obra;
    if (presupuesto_total) insert.presupuesto_total = Number(presupuesto_total);

    // Acepta nombres viejos y nuevos de columna de fecha
    const fechaInicio = fecha_inicio_plan || fecha_inicio;
    const fechaFin    = fecha_fin_plan    || fecha_fin_estimada;
    if (fechaInicio) insert.fecha_inicio_plan = fechaInicio;
    if (fechaFin)    insert.fecha_fin_plan    = fechaFin;

    const { data, error } = await supabase.from("obras").insert([insert]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
