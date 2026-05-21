export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// POST — Crear nuevo material + entrada en inventario
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nombre, codigo, categoria, unidad_medida, descripcion,
      cantidad_actual, cantidad_disponible, stock_minimo,
      precio_unitario, precio_unitario_referencia, ubicacion,
    } = body;

    if (!nombre || !unidad_medida || !categoria) {
      return NextResponse.json(
        { error: "Campos requeridos: nombre, unidad_medida, categoria" },
        { status: 400 }
      );
    }

    // Insertar en materiales — stock_minimo y precio van aquí
    const materialInsert: Record<string, unknown> = { nombre, categoria, unidad_medida };
    if (codigo)      materialInsert.codigo      = codigo;
    if (descripcion) materialInsert.descripcion = descripcion;
    const stockMin = Number(stock_minimo ?? 0);
    if (stockMin > 0) materialInsert.stock_minimo = stockMin;
    const precioRef = Number(precio_unitario ?? precio_unitario_referencia ?? 0);
    if (precioRef > 0) materialInsert.precio_unitario_referencia = precioRef;

    const { data: material, error: matError } = await supabase
      .from("materiales")
      .insert([materialInsert])
      .select()
      .single();

    if (matError) return NextResponse.json({ error: matError.message }, { status: 500 });

    // Insertar en inventario — columna real: cantidad_disponible
    const cantidadReal = Number(cantidad_disponible ?? cantidad_actual ?? 0);
    const inventarioInsert: Record<string, unknown> = {
      material_id:         material.id,
      cantidad_disponible: cantidadReal,
    };
    if (ubicacion) inventarioInsert.ubicacion = ubicacion;

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
    const { inventario_id, cantidad_actual, cantidad_disponible } = body;

    if (!inventario_id) {
      return NextResponse.json({ error: "inventario_id es requerido" }, { status: 400 });
    }

    // Aceptar cantidad_disponible o cantidad_actual (del formulario antiguo)
    const nuevaCantidad = cantidad_disponible ?? cantidad_actual;
    if (nuevaCantidad === undefined) {
      return NextResponse.json({ error: "cantidad_disponible es requerida" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("inventario")
      .update({ cantidad_disponible: Number(nuevaCantidad) })
      .eq("id", inventario_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
