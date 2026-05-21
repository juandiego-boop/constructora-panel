import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const table = url.searchParams.get("table") ?? "tareas";

  // Get one row with all columns to see real schema
  const { data, error } = await supabase.from(table as any).select("*").limit(1);

  // Also try inserting a minimal test row to see error
  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

  return NextResponse.json({
    table,
    error: error?.message,
    columns,
    sample: data?.[0] ?? null,
  });
}
