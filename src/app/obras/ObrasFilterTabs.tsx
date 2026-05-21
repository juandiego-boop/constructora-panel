"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FILTROS = [
  { label: "Todas", value: "" },
  { label: "En ejecución", value: "en_ejecucion" },
  { label: "Planificación", value: "planificacion" },
  { label: "En pausa", value: "pausada" },
  { label: "Finalizadas", value: "finalizada" },
  { label: "Canceladas", value: "cancelada" },
];

export default function ObrasFilterTabs() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("estado") ?? "";

  function setFiltro(val: string) {
    const url = val ? `/obras?estado=${val}` : "/obras";
    router.push(url);
  }

  return (
    <div className="flex gap-1.5 flex-wrap mb-5">
      {FILTROS.map(f => (
        <button
          key={f.value}
          onClick={() => setFiltro(f.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            current === f.value
              ? "bg-[#1a5276] text-white border-[#1a5276] shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#1a5276] hover:text-[#1a5276]"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
