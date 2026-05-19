export const dynamic = "force-dynamic";

import { supabase, formatPeso, formatFecha } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Badge, { estadoProspectoVariant, prioridadVariant } from "@/components/Badge";
import NuevoProspectoBtn from "./NuevoProspectoBtn";
import { Phone, Mail, MapPin, Calendar } from "lucide-react";



async function getProspectos() {
  const { data } = await supabase
    .from("prospectos")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

const ESTADO_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_negociacion: "En negociación",
  convertido: "Convertido",
  perdido: "Perdido",
};

const PRIORIDAD_EMOJI: Record<string, string> = {
  alta: "🔥",
  media: "🟡",
  baja: "❄️",
};

export default async function ProspectosPage() {
  const prospectos = await getProspectos();

  const stats = {
    total: prospectos.length,
    nuevos: prospectos.filter((p: any) => p.estado_crm === "nuevo").length,
    hot: prospectos.filter((p: any) => p.prioridad === "alta").length,
    convertidos: prospectos.filter((p: any) => p.estado_crm === "convertido").length,
  };

  return (
    <div>
      <PageHeader
        title="Prospectos"
        subtitle={`${stats.total} registros · ${stats.nuevos} nuevos · ${stats.hot} HOT`}
        action={<NuevoProspectoBtn />}
      />

      {/* Stats rápidas */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, color: "bg-blue-50 border-blue-100 text-blue-800" },
          { label: "Nuevos", value: stats.nuevos, color: "bg-purple-50 border-purple-100 text-purple-800" },
          { label: "🔥 HOT", value: stats.hot, color: "bg-red-50 border-red-100 text-red-700" },
          { label: "Convertidos", value: stats.convertidos, color: "bg-green-50 border-green-100 text-green-800" },
        ].map(s => (
          <div key={s.label} className={`rounded-lg border p-3 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Nombre</th>
                <th className="px-4 py-3.5">Contacto</th>
                <th className="px-4 py-3.5">Proyecto</th>
                <th className="px-4 py-3.5">Presupuesto</th>
                <th className="px-4 py-3.5">Prioridad</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prospectos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                    No hay prospectos. ¡Agrega el primero!
                  </td>
                </tr>
              ) : prospectos.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{p.nombre}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{p.ciudad ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="flex items-center gap-1 text-gray-700">
                      <Phone className="w-3 h-3 text-gray-400" /> {p.telefono}
                    </p>
                    {p.email && (
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Mail className="w-3 h-3" /> {p.email}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-gray-700">{p.tipo_proyecto?.replace(/_/g, " ") ?? "—"}</p>
                    <p className="text-xs text-gray-400">{p.fuente ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-800">
                    {formatPeso(p.presupuesto_estimado)}
                  </td>
                  <td className="px-4 py-3.5">
                    {p.prioridad ? (
                      <Badge variant={prioridadVariant[p.prioridad] ?? "gray"}>
                        {PRIORIDAD_EMOJI[p.prioridad]} {p.prioridad}
                      </Badge>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={estadoProspectoVariant[p.estado_crm] ?? "gray"}>
                      {ESTADO_LABELS[p.estado_crm] ?? p.estado_crm}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatFecha(p.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
