"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const ESTADOS = [
  { value: "planificacion", label: "Planificación" },
  { value: "en_ejecucion",  label: "En ejecución" },
  { value: "en_pausa",      label: "En pausa" },
];

export default function NuevaObraBtn() {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    nombre_obra: "", codigo_obra: "", descripcion: "",
    ciudad: "", direccion: "", estado: "planificacion",
    presupuesto_total: "", fecha_inicio: "", fecha_fin_estimada: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_obra:      form.nombre_obra,
          codigo_obra:      form.codigo_obra      || undefined,
          descripcion:      form.descripcion      || undefined,
          ciudad:           form.ciudad           || undefined,
          direccion:        form.direccion         || undefined,
          estado:           form.estado,
          presupuesto_total: form.presupuesto_total ? Number(form.presupuesto_total) : undefined,
          fecha_inicio:      form.fecha_inicio      || undefined,
          fecha_fin_estimada: form.fecha_fin_estimada || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Error al guardar"); return; }
      setOpen(false);
      setForm({ nombre_obra: "", codigo_obra: "", descripcion: "", ciudad: "", direccion: "", estado: "planificacion", presupuesto_total: "", fecha_inicio: "", fecha_fin_estimada: "" });
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
        <Plus className="w-4 h-4" /> Nueva Obra
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg">Nueva Obra</h3>
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre de la obra *</label>
                  <input required value={form.nombre_obra} onChange={e => setForm({ ...form, nombre_obra: e.target.value })}
                    placeholder="Ej: Casa Campestre Los Pinos" className={field} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Código</label>
                  <input value={form.codigo_obra} onChange={e => setForm({ ...form, codigo_obra: e.target.value })}
                    placeholder="OBR-001" className={field} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
                  <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}
                    className={`${field} bg-white`}>
                    {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ciudad</label>
                  <input value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })}
                    placeholder="Bogotá" className={field} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Presupuesto total (COP)</label>
                  <input type="number" value={form.presupuesto_total} onChange={e => setForm({ ...form, presupuesto_total: e.target.value })}
                    placeholder="500000000" className={field} />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Dirección</label>
                  <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Calle 123 # 45-67" className={field} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha inicio</label>
                  <input type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
                    className={field} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha fin estimada</label>
                  <input type="date" value={form.fecha_fin_estimada} onChange={e => setForm({ ...form, fecha_fin_estimada: e.target.value })}
                    className={field} />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción</label>
                  <textarea rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Detalles del proyecto..." className={`${field} resize-none`} />
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
                  {loading ? "Guardando..." : "Crear Obra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
