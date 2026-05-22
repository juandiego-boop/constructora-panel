"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, PlayCircle, XCircle, RotateCcw,
  Trash2, ChevronDown, Loader2, Pencil, X, Save,
} from "lucide-react";

type Estado = "pendiente" | "en_progreso" | "bloqueada" | "completada";

export type Tarea = {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: string;
  fecha_fin_plan?: string;
  fecha_fin_real?: string;
  porcentaje_avance?: number;
};

const TRANSICIONES: Record<string, { value: Estado; label: string; icon: React.ReactNode; color: string }[]> = {
  pendiente:   [
    { value: "en_progreso", label: "Iniciar",   icon: <PlayCircle   className="w-3.5 h-3.5" />, color: "text-blue-600"   },
    { value: "completada",  label: "Completar", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-600"  },
    { value: "bloqueada",   label: "Bloquear",  icon: <XCircle      className="w-3.5 h-3.5" />, color: "text-orange-600" },
  ],
  en_progreso: [
    { value: "completada",  label: "Completar", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-600"  },
    { value: "bloqueada",   label: "Bloquear",  icon: <XCircle      className="w-3.5 h-3.5" />, color: "text-orange-600" },
    { value: "pendiente",   label: "Pausar",    icon: <RotateCcw    className="w-3.5 h-3.5" />, color: "text-gray-600"   },
  ],
  bloqueada:   [
    { value: "en_progreso", label: "Desbloquear", icon: <PlayCircle   className="w-3.5 h-3.5" />, color: "text-blue-600"  },
    { value: "completada",  label: "Completar",   icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-600" },
  ],
  completada:  [
    { value: "en_progreso", label: "Reabrir", icon: <RotateCcw className="w-3.5 h-3.5" />, color: "text-blue-600" },
  ],
};

const field = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276]";

type Props = {
  tarea: Tarea;
  onUpdate: (id: string, changes: Partial<Tarea>) => void;
  onDelete: (id: string) => void;
};

export default function AccionesTareaBtn({ tarea, onUpdate, onDelete }: Props) {
  const router = useRouter();
  const [open, setOpen]         = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [editForm, setEditForm] = useState({
    nombre:            tarea.nombre           ?? "",
    descripcion:       tarea.descripcion      ?? "",
    fecha_fin_plan:    tarea.fecha_fin_plan   ?? "",
    porcentaje_avance: String(tarea.porcentaje_avance ?? 0),
  });

  const patch = async (body: Record<string, unknown>) => {
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/tareas/${tarea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        onUpdate(tarea.id, json);
        router.refresh(); // Sincronizar server cache
      } else {
        alert(`Error al actualizar tarea: ${json.error ?? res.statusText}`);
      }
    } catch (err) {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async () => {
    if (!confirm("¿Eliminar esta tarea? No se puede deshacer.")) return;
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/tareas/${tarea.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete(tarea.id);
        router.refresh();
      } else {
        const json = await res.json().catch(() => ({}));
        alert(`Error al eliminar tarea: ${json.error ?? res.statusText}`);
      }
    } catch {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditOpen(false);
    await patch({
      nombre:            editForm.nombre,
      descripcion:       editForm.descripcion       || null,
      fecha_fin_plan:    editForm.fecha_fin_plan     || null,
      porcentaje_avance: Number(editForm.porcentaje_avance),
    });
  };

  const opciones = TRANSICIONES[tarea.estado] ?? [];

  return (
    <>
      {/* ── Dropdown Acciones ─────────────────────────────── */}
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md px-2 py-1 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <ChevronDown className="w-3.5 h-3.5" />}
          Acciones
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden py-1">

              {/* Editar */}
              <button
                onClick={() => { setOpen(false); setEditOpen(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-gray-500" />
                Editar
              </button>

              {/* Transiciones de estado */}
              {opciones.length > 0 && (
                <div className="border-t border-gray-100 mt-1 pt-1">
                  {opciones.map(op => (
                    <button
                      key={op.value}
                      onClick={() => { setOpen(false); patch({ estado: op.value }); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${op.color}`}
                    >
                      {op.icon}
                      {op.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Eliminar */}
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

      {/* ── Modal Editar ──────────────────────────────────── */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Editar tarea</h3>
              <button onClick={() => setEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarEdicion} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre *</label>
                <input
                  required
                  value={editForm.nombre}
                  onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                  className={field}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={editForm.descripcion}
                  onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })}
                  className={`${field} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha vencimiento</label>
                  <input
                    type="date"
                    value={editForm.fecha_fin_plan}
                    onChange={e => setEditForm({ ...editForm, fecha_fin_plan: e.target.value })}
                    className={field}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Avance: <span className="text-[#1a5276] font-bold">{editForm.porcentaje_avance}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editForm.porcentaje_avance}
                    onChange={e => setEditForm({ ...editForm, porcentaje_avance: e.target.value })}
                    className="w-full mt-2 accent-[#1a5276]"
                  />
                </div>
              </div>

              {/* Barra de avance preview */}
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${Number(editForm.porcentaje_avance) >= 100 ? "bg-green-500" : Number(editForm.porcentaje_avance) >= 50 ? "bg-blue-500" : "bg-yellow-400"}`}
                  style={{ width: `${editForm.porcentaje_avance}%` }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1a5276] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#154360] flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
