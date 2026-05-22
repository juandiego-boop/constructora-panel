export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (body.estado_crm !== undefined) update.estado_crm = body.estado_crm;
  if (body.notas_seguimiento !== undefined) update.notas_seguimiento = body.notas_seguimiento;
  if (body.score_ia !== undefined) update.score_ia = Number(body.score_ia);

  const { data, error } = await supabase
    .from("prospectos")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
