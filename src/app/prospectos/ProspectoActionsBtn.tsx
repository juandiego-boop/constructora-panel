"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, PhoneCall, Star, FileText, Handshake, Trophy, XCircle, Loader2 } from "lucide-react";

type EstadoCRM = "nuevo" | "contactado" | "calificado" | "propuesta" | "negociando" | "ganado" | "perdido";

interface Props {
  prospectoId: string;
  estadoActual: EstadoCRM;
}

const SIGUIENTE: Partial<Record<EstadoCRM, { estado: EstadoCRM; label: string; icon: ReactNode }[]>> = {
  nuevo:      [{ estado: "contactado", label: "Marcar contactado", icon: <PhoneCall className="w-3.5 h-3.5 text-blue-500" /> }],
  contactado: [{ estado: "calificado", label: "Calificar prospecto", icon: <Star className="w-3.5 h-3.5 text-yellow-500" /> }],
  calificado: [{ estado: "propuesta", label: "Enviar propuesta", icon: <FileText className="w-3.5 h-3.5 text-purple-500" /> }],
  propuesta:  [{ estado: "negociando", label: "En negociación", icon: <Handshake className="w-3.5 h-3.5 text-orange-500" /> }],
  negociando: [
    { estado: "ganado", label: "¡Negocio ganado!", icon: <Trophy className="w-3.5 h-3.5 text-green-500" /> },
    { estado: "perdido", label: "Marcar perdido", icon: <XCircle className="w-3.5 h-3.5 text-red-500" /> },
  ],
};

export default function ProspectoActionsBtn({ prospectoId, estadoActual }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function cambiarEstado(nuevoEstado: EstadoCRM) {
    setOpen(false);
    setLoading(true);
    await fetch(`/api/prospectos/${prospectoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado_crm: nuevoEstado }),
    });
    setLoading(false);
    router.refresh();
  }

  const acciones = SIGUIENTE[estadoActual] ?? [];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Acciones"
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <MoreVertical className="w-4 h-4" />}
      </button>

      {open && acciones.length > 0 && (
        <div className="absolute right-0 top-8 z-50 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[190px]">
          {acciones.map(a => (
            <button
              key={a.estado}
              onClick={() => cambiarEstado(a.estado)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              {a.icon}
              {a.label}
            </button>
          ))}
          {estadoActual !== "perdido" && estadoActual !== "ganado" && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => cambiarEstado("perdido")}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 text-left"
              >
                <XCircle className="w-3.5 h-3.5" /> Marcar perdido
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
