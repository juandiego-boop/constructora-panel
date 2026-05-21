import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Admin SQL endpoint — solo para setup/mantenimiento
// Ejecuta múltiples statements separados por punto y coma
export async function POST(req: Request) {
  const { sql, secret } = await req.json();

  // Protección mínima
  if (secret !== "fix-constructora-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results: any[] = [];

  // Dividir por ; y ejecutar cada statement
  const statements = sql
    .split(";")
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);

  for (const stmt of statements) {
    try {
      // Usar rpc si existe, sino ejecutar directo via supabase
      const { data, error } = await supabase.rpc("exec_sql_admin", { query: stmt }).single();
      results.push({ stmt: stmt.slice(0, 80), data, error: error?.message });
    } catch (e: any) {
      results.push({ stmt: stmt.slice(0, 80), error: e.message });
    }
  }

  return NextResponse.json({ results });
}
