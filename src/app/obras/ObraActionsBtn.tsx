"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical, Play, Pause, CheckCircle, XCircle,
  TrendingUp, Loader2, Pencil, X,
} from "lucide-react";

type Estado = "planificacion" | "en_ejecucion" | "pausada" | "finalizada" | "cancelada";

interface ObraData {
  nombre?: string;
  ciudad?: string;
  direccion?: string;
  codigo_obra?: string;
  tipo_obra?: string;
  descripcion?: string;
  presupuesto_total?: number;
  fecha_inicio_plan?: string;
  fecha_fin_plan?: string;
  estado?: string;
  avance_porcentaje?: number;
}

interface Props {
  obraId: string;
  obraEstado: Estado;
  obraAvance: number;
  obraData?: ObraData;
}

const ESTADOS = [
  { value: "planificacion", label: "Planificación" },
  { value: "en_ejecucion",  label: "En ejecución" },
  { value: "pausada",       label: "En pausa" },
  { value: "finalizada",    label: "Finalizada" },
  { value: "cancelada",     label: "Cancelada" },
];

export default function ObraActionsBtn({ obraId, obraEstado, obraAvance, obraData }: Props) {
  const router = useRouter();
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [showAvance, setShowAvance] = useState(false);
  const [showEdit, setShowEdit]   = useState(false);
  const [avanceInput, setAvanceInput] = useState(String(obraAvance));
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm]   = useState({
    nombre:           obraData?.nombre           ?? "",
    ciudad:           obraData?.ciudad           ?? "",
    direccion:        obraData?.direccion         ?? "",
    codigo_obra:      obraData?.codigo_obra       ?? "",
    tipo_obra:        obraData?.tipo_obra         ?? "",
    descripcion:      obraData?.descripcion       ?? "",
    presupuesto_total: obraData?.presupuesto_total != null ? String(obraData.presupuesto_total) : "",
    fecha_inicio_plan: obraData?.fecha_inicio_plan?.slice(0, 10) ?? "",
    fecha_fin_plan:    obraData?.fecha_fin_plan?.slice(0, 10)    ?? "",
    estado:           obraData?.estado            ?? obraEstado,
    avance_porcentaje: String(obraAvance),
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sincronizar editForm cuando cambian los props (en detalle de obra)
  useEffect(() => {
    setEditForm({
      nombre:            obraData?.nombre           ?? "",
      ciudad:            obraData?.ciudad           ?? "",
      direccion:         obraData?.direccion         ?? "",
      codigo_obra:       obraData?.codigo_obra       ?? "",
      tipo_obra:         obraData?.tipo_obra         ?? "",
      descripcion:       obraData?.descripcion       ?? "",
      presupuesto_total: obraData?.presupuesto_total != null ? String(obraData.presupuesto_total) : "",
      fecha_inicio_plan: obraData?.fecha_inicio_plan?.slice(0, 10) ?? "",
      fecha_fin_plan:    obraData?.fecha_fin_plan?.slice(0, 10)    ?? "",
      estado:            obraData?.estado ?? obraEstado,
      avance_porcentaje: String(obraAvance),
    });
    setAvanceInput(String(obraAvance));
  }, [obraId, obraData, obraEstado, obraAvance]);

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/obras/${obraId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? res.statusText);
    }
    return res.json();
  }

  async function cambiarEstado(nuevoEstado: Estado) {
    setOpen(false);
    setLoading(true);
    try {
      await patch({ estado: nuevoEstado });
      router.refresh();
    } catch (e: any) {
      alert(`Error al cambiar estado: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function actualizarAvance() {
    const val = Math.min(100, Math.max(0, Number(avanceInput)));
    setLoading(true);
    setShowAvance(false);
    try {
      await patch({ avance_porcentaje: val });
      router.refresh();
    } catch (e: any) {
      alert(`Error al actualizar avance: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function guardarEdicion(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    setLoading(true);
    try {
      await patch({
        nombre:            editForm.nombre,
        ciudad:            editForm.ciudad           || null,
        direccion:         editForm.direccion         || null,
        codigo_obra:       editForm.codigo_obra       || undefined,
        tipo_obra:         editForm.tipo_obra         || null,
        descripcion:       editForm.descripcion       || null,
        presupuesto_total: editForm.presupuesto_total ? Number(editForm.presupuesto_total) : null,
        fecha_inicio_plan: editForm.fecha_inicio_plan || null,
        fecha_fin_plan:    editForm.fecha_fin_plan    || null,
        estado:            editForm.estado,
        avance_porcentaje: Number(editForm.avance_porcentaje),
      });
      setShowEdit(false);
      router.refresh();
    } catch (e: any) {
      setEditError(e.message ?? "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  const acciones = [
    {
      label: "Editar obra",
      icon: <Pencil className="w-3.5 h-3.5 text-[#1a5276]" />,
      onClick: () => { setOpen(false); setShowEdit(true); },
    },
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

  const field = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276]";

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón principal */}
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Acciones"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
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
                type="number" min={0} max={100}
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
              >Cancelar</button>
              <button
                onClick={actualizarAvance}
                className="flex-1 py-2 rounded-lg bg-[#1a5276] text-white text-sm font-medium hover:bg-[#154360]"
              >Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición completa */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900 text-lg">Editar Obra</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={guardarEdicion} className="px-6 py-5 space-y-4">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                  {editError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre de la obra *</label>
                  <input
                    required
                    value={editForm.nombre}
                    onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                    placeholder="Ej: Casa Campestre Los Pinos"
                    className={field}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Código</label>
                  <input
                    value={editForm.codigo_obra}
                    onChange={e => setEditForm({ ...editForm, codigo_obra: e.target.value })}
                    placeholder="OB-2025-001"
                    className={field}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
                  <select
                    value={editForm.estado}
                    onChange={e => setEditForm({ ...editForm, estado: e.target.value })}
                    className={`${field} bg-white`}
                  >
                    {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ciudad</label>
                  <input
                    value={editForm.ciudad}
                    onChange={e => setEditForm({ ...editForm, ciudad: e.target.value })}
                    placeholder="Bogotá"
                    className={field}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Presupuesto (COP)</label>
                  <input
                    type="number"
                    value={editForm.presupuesto_total}
                    onChange={e => setEditForm({ ...editForm, presupuesto_total: e.target.value })}
                    placeholder="500000000"
                    className={field}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Dirección</label>
                  <input
                    value={editForm.direccion}
                    onChange={e => setEditForm({ ...editForm, direccion: e.target.value })}
                    placeholder="Calle 123 # 45-67"
                    className={field}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    value={editForm.fecha_inicio_plan}
                    onChange={e => setEditForm({ ...editForm, fecha_inicio_plan: e.target.value })}
                    className={field}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha fin estimada</label>
                  <input
                    type="date"
                    value={editForm.fecha_fin_plan}
                    onChange={e => setEditForm({ ...editForm, fecha_fin_plan: e.target.value })}
                    className={field}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Avance físico (%)</label>
                  <input
                    type="number" min={0} max={100}
                    value={editForm.avance_porcentaje}
                    onChange={e => setEditForm({ ...editForm, avance_porcentaje: e.target.value })}
                    className={field}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de obra</label>
                  <input
                    value={editForm.tipo_obra}
                    onChange={e => setEditForm({ ...editForm, tipo_obra: e.target.value })}
                    placeholder="casa_nueva, remodelacion..."
                    className={field}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={editForm.descripcion}
                    onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })}
                    placeholder="Detalles del proyecto..."
                    className={`${field} resize-none`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#1a5276] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#154360] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                  {loading ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
      }
