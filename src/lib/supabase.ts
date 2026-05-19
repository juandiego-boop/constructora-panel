import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente server-side con service role (bypasa RLS)
export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// ── Tipos ────────────────────────────────────────────────────────────────────

export type EstadoObra =
  | "planificacion" | "en_ejecucion" | "pausada" | "finalizada" | "cancelada";

export type EstadoProspecto =
  | "nuevo" | "contactado" | "en_negociacion" | "convertido" | "perdido";

export type PrioridadProspecto = "alta" | "media" | "baja";

export type Prospecto = {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp?: string;
  email?: string;
  ciudad?: string;
  tipo_proyecto?: string;
  fuente?: string;
  presupuesto_estimado?: number;
  estado_crm: EstadoProspecto;
  prioridad?: PrioridadProspecto;
  fecha_primer_contacto?: string;
  notas?: string;
  created_at: string;
};

export type Obra = {
  id: string;
  codigo_obra?: string;
  nombre: string;
  descripcion?: string;
  estado: EstadoObra;
  avance_porcentaje?: number;
  presupuesto_total?: number;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  ciudad?: string;
  direccion?: string;
  created_at: string;
};

export type Pago = {
  id: string;
  obra_id?: string;
  concepto: string;
  monto: number;
  monto_pagado?: number;
  fecha_vencimiento?: string;
  fecha_pago?: string;
  estado: string;
  created_at: string;
};

export type Gasto = {
  id: string;
  obra_id?: string;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha_gasto: string;
  proveedor?: string;
  created_at: string;
};

// ── Helpers formato ───────────────────────────────────────────────────────────

export function formatPeso(n?: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatFecha(f?: string | null): string {
  if (!f) return "—";
  return new Date(f).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
