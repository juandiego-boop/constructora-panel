"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PlayCircle, XCircle, Trash2, ChevronDown, Loader2 } from "lucide-react";

type Estado = "pendiente" | "en_progreso" | "bloqueada" | "completada";

const ESTADOS: { value: Estado; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "en_progreso", label: "Iniciar",    icon: <PlayCircle  className="w-3.5 h-3.5" />, color: "text-blue-600"  },
  { value: "completada",  label: "Completar",  icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-600" },
  { value: "bloqueada",   label: "Bloquear",   icon: <XCircle     className="w-3.5 h-3.5" />, color: "text-orange-600" },
  { value: "pendiente",   label: "Reabrir",    icon: <ChevronDown className="w-3.5 h-3.5" />, color: "text-gray-600"  },
];

export default function AccionesTareaBtn({
  tareaId,
  estadoActual,
}: {
  tareaId: string;
  estadoActual: string;
}) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const cambiarEstado = async (nuevoEstado: Estado) => {
    setOpen(false);
    setLoading(true);
    try {
      await fetch(`/api/tareas/${tareaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async () => {
    if (!confirm("¿Eliminar esta tarea? Esta acción no se puede deshacer.")) return;
    setOpen(false);
    setLoading(true);
    try {
      await fetch(`/api/tareas/${tareaId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // Opciones disponibles según estado actual
  const opciones = ESTADOS.filter(e => e.value !== estadoActual);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md px-2 py-1 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
        Acciones
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden py-1">
            {opciones.map(op => (
              <button
                key={op.value}
                onClick={() => cambiarEstado(op.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${op.color}`}
              >
                {op.icon}
                {op.label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={eliminar}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
