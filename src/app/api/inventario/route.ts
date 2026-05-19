import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// POST — Crear nuevo material + entrada en inventario
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre, codigo, categoria, unidad_medida, descripcion,
      cantidad_actual, stock_minimo, precio_unitario, ubicacion,
    } = body;

    if (!nombre || !unidad_medida || !categoria) {
      return NextResponse.json(
        { error: "Campos requeridos: nombre, unidad_medida, categoria" },
        { status: 400 }
      );
    }

    // 1. Insertar en tabla materiales
    const materialInsert: Record<string, unknown> = {
      nombre,
      categoria,
      unidad_medida,
    };
    if (codigo)      materialInsert.codigo      = codigo;
    if (descripcion) materialInsert.descripcion = descripcion;

    const { data: material, error: matError } = await supabase
      .from("materiales")
      .insert([materialInsert])
      .select()
      .single();

    if (matError) return NextResponse.json({ error: matError.message }, { status: 500 });

    // 2. Insertar en tabla inventario
    const inventarioInsert: Record<string, unknown> = {
      material_id:     material.id,
      cantidad_actual: Number(cantidad_actual ?? 0),
      stock_minimo:    Number(stock_minimo ?? 0),
    };
    if (precio_unitario) inventarioInsert.precio_unitario = Number(precio_unitario);
    if (ubicacion)       inventarioInsert.ubicacion       = ubicacion;

    const { data: inv, error: invError } = await supabase
      .from("inventario")
      .insert([inventarioInsert])
      .select()
      .single();

    if (invError) return NextResponse.json({ error: invError.message }, { status: 500 });

    return NextResponse.json({ material, inventario: inv }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// PATCH — Ajustar stock de un item de inventario existente
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { inventario_id, cantidad_actual, stock_minimo, precio_unitario } = body;

    if (!inventario_id) {
      return NextResponse.json({ error: "inventario_id es requerido" }, { status: 400 });
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (cantidad_actual !== undefined) update.cantidad_actual = Number(cantidad_actual);
    if (stock_minimo    !== undefined) update.stock_minimo    = Number(stock_minimo);
    if (precio_unitario !== undefined) update.precio_unitario = Number(precio_unitario);

    const { data, error } = await supabase
      .from("inventario")
      .update(update)
      .eq("id", inventario_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
