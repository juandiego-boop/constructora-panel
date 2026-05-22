"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Play, Pause, CheckCircle, XCircle, TrendingUp, Loader2 } from "lucide-react";

type Estado = "planificacion" | "en_ejecucion" | "pausada" | "finalizada" | "cancelada";

interface Props {
  obraId: string;
  obraEstado: Estado;
  obraAvance: number;
}

export default function ObraActionsBtn({ obraId, obraEstado, obraAvance }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAvance, setShowAvance] = useState(false);
  const [avanceInput, setAvanceInput] = useState(String(obraAvance));
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function cambiarEstado(nuevoEstado: Estado) {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/obras/${obraId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(`Error al cambiar estado: ${json.error ?? res.statusText}`);
        return;
      }
      router.refresh();
    } catch {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function actualizarAvance() {
    const val = Math.min(100, Math.max(0, Number(avanceInput)));
    setLoading(true);
    setShowAvance(false);
    try {
      const res = await fetch(`/api/obras/${obraId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avance_porcentaje: val }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(`Error al actualizar avance: ${json.error ?? res.statusText}`);
        return;
      }
      router.refresh();
    } catch {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  const acciones = [
    obraEstado !== "en_ejecucion" && obraEstado !== "finalizada" && obraEstado !== "cancelada" && {
      label: "Reanudar / Iniciar",
      icon: <Play className="w-3.5 h-3.5 text-green-600" />,
      onClick: () => cambiarEstado("en_ejecucion"),
    },
    obraEstado === "en_ejecucion" && {
      label: "Pausar obra",
      icon: <Pause className="w-3.5 h-3.5 text-yellow-600" />,
      onClick: () => cambiarEstado("pausada"),
    },
    obraEstado !== "finalizada" && obraEstado !== "cancelada" && {
      label: "Actualizar avance %",
      icon: <TrendingUp className="w-3.5 h-3.5 text-blue-600" />,
      onClick: () => { setOpen(false); setShowAvance(true); },
    },
    obraEstado !== "finalizada" && obraEstado !== "cancelada" && {
      label: "Marcar finalizada",
      icon: <CheckCircle className="w-3.5 h-3.5 text-[#1a5276]" />,
      onClick: () => cambiarEstado("finalizada"),
    },
    obraEstado !== "cancelada" && {
      label: "Cancelar obra",
      icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
      onClick: () => {
        if (confirm("¿Seguro que quieres cancelar esta obra?")) cambiarEstado("cancelada");
      },
    },
  ].filter(Boolean) as { label: string; icon: ReactNode; onClick: () => void }[];

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón principal */}
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Acciones"
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <MoreVertical className="w-4 h-4" />
        }
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-8 z-50 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[180px]">
          {acciones.map(a => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Modal de avance */}
      {showAvance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h3 className="font-semibold text-gray-900 mb-4">Actualizar avance físico</h3>
            <div className="flex items-center gap-3 mb-5">
              <input
                type="number"
                min={0}
                max={100}
                value={avanceInput}
                onChange={e => setAvanceInput(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#1a5276]"
                autoFocus
              />
              <span className="text-2xl font-bold text-gray-400">%</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAvance(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={actualizarAvance}
                className="flex-1 py-2 rounded-lg bg-[#1a5276] text-white text-sm font-medium hover:bg-[#154360]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
