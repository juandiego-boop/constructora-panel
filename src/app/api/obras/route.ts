export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("obras")
    .select("id, nombre_obra, codigo_obra")
    .not("estado", "eq", "cancelada")
    .order("nombre_obra");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre_obra, codigo_obra, descripcion, ciudad, direccion,
      estado, presupuesto_total, fecha_inicio, fecha_fin_estimada,
    } = body;

    if (!nombre_obra) {
      return NextResponse.json({ error: "nombre_obra es requerido" }, { status: 400 });
    }

    const insert: Record<string, unknown> = {
      nombre_obra,
      estado: estado || "planificacion",
      avance_porcentaje: 0,
    };
    if (codigo_obra)       insert.codigo_obra       = codigo_obra;
    if (descripcion)       insert.descripcion       = descripcion;
    if (ciudad)            insert.ciudad            = ciudad;
    if (direccion)         insert.direccion         = direccion;
    if (presupuesto_total) insert.presupuesto_total = Number(presupuesto_total);
    if (fecha_inicio)      insert.fecha_inicio      = fecha_inicio;
    if (fecha_fin_estimada) insert.fecha_fin_estimada = fecha_fin_estimada;

    const { data, error } = await supabase.from("obras").insert([insert]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno 