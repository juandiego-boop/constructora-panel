export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase.rpc("kpis_generales");
  return NextResponse.json({ data, error, typeofData: typeof data });
}
