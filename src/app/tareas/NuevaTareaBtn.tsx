"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";

const PRIORIDADES = ["critica", "alta", "media", "baja"];
const ESTADOS     = ["pendiente", "en_progreso", "bloqueada"];

type Obra = { id: string; nombre: string; codigo_obra?: string };

export default function NuevaTareaBtn() {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [obras, setObras]     = useState<Obra[]>([]);
  const [form, setForm]       = useState({
    titulo: "", descripcion: "", obra_id: "",
    responsable: "", fecha_vencimiento: "",
    prioridad: "media", estado: "pendiente",
  });

  useEffect(() => {
    if (open && obras.length === 0) {
      fetch("/api/obras")
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setObras(data); })
        .catch(() => {});
    }
  }, [open, obras.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo:           form.titulo,
          descripcion:      form.descripcion      || undefined,
          obra_id:          form.obra_id          || undefined,
          responsable:      form.responsable      || undefined,
          fecha_vencimiento: form.fecha_vencimiento || undefined,
          prioridad:        form.prioridad,
          estado:           form.estado,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Error al guardar"); return; }
      setOpen(false);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276]";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[#1a5276] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#154360] transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" /> Nueva Tarea
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg">Nueva Tarea</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Título *</label>
                  <input required value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                    placeholder="Ej: Instalar vigas de cubierta bloque A" className={field} />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Obra</label>
                  <select value={form.obra_id} onChange={e => setForm({ ...form, obra_id: e.target.value })}
                    className={`${field} bg-white`}>
                    <option value="">— Sin obra asociada —</option>
                    {obras.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.codigo_obra ? `[${o.codigo_obra}] ` : ""}{o.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Prioridad</label>
                  <select value={form.prioridad} onChange={e => setForm({ ...form, prioridad: e.target.value })}
                    className={`${field} bg-white`}>
                    {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
                  <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}
                    className={`${field} bg-white`}>
                    {ESTADOS.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Responsable</label>
                  <input value={form.responsable}
                    onChange={e => setForm({ ...form, responsable: e.target.value })}
                    placeholder="Nombre del responsable" className={field} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha vencimiento</label>
                  <input type="date" value={form.fecha_vencimiento}
                    onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })} className={field} />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                  <textarea rows={2} value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Detalles adicionales de la tarea..."
                    className={`${field} resize-none`} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-[#1a5276] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#154360] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {loading ? "Guardando..." : "Crear Tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
