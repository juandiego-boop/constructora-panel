import Link from "next/link";

const FILTROS = [
  { label: "Todas", value: "" },
  { label: "En ejecución", value: "en_ejecucion" },
  { label: "Planificación", value: "planificacion" },
  { label: "En pausa", value: "pausada" },
  { label: "Finalizadas", value: "finalizada" },
  { label: "Canceladas", value: "cancelada" },
];

export default function ObrasFilterTabs({ current }: { current: string }) {
  return (
    <div className="flex gap-1.5 flex-wrap mb-5">
      {FILTROS.map(f => (
        <Link
          key={f.value}
          href={f.value ? `/obras?estado=${f.value}` : "/obras"}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            current === f.value
              ? "bg-[#1a5276] text-white border-[#1a5276] shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#1a5276] hover:text-[#1a5276]"
          }`}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
