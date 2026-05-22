"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";

// Valores reales del enum categoria_gasto_enum en Supabase
const CATEGORIAS = [
  "material", "mano_obra", "transporte", "herramienta", "subcontrato", "indirecto", "otro"
];

type Obra = { id: string; nombre: string; codigo_obra?: string };

export default function NuevoGastoBtn() {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [obras, setObras]     = useState<Obra[]>([]);
  const [form, setForm]       = useState({
    obra_id: "", categoria: "material", descripcion: "",
    monto: "", fecha_gasto: new Date().toISOString().split("T")[0],
    proveedor: "",
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
      const res = await fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          obra_id:     form.obra_id     || undefined,
          categoria:   form.categoria,
          descripcion: form.descripcion,
          monto:       Number(form.monto),
          fecha_gasto: form.fecha_gasto,
          proveedor:   form.proveedor   || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Error al guardar"); return; }
      setOpen(false);
      window.location.reload();
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
        <Plus className="w-4 h-4" /> Registrar Gasto
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg">Registrar Gasto</h3>
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Obra (opcional)</label>
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría *</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}
                    className={`${field} bg-white`}>
                    {CATEGORIAS.map(c => (
                      <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha *</label>
                  <input type="date" required value={form.fecha_gasto}
                    onChange={e => setForm({ ...form, fecha_gasto: e.target.value })} className={field} />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Descripción *</label>
                  <input required value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Ej: Compra de cemento Portland 50kg" className={field} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Monto (COP) *</label>
                  <input required type="number" value={form.monto}
                    onChange={e => setForm({ ...form, monto: e.target.value })}
                    placeholder="850000" className={field} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Proveedor</label>
                  <input value={form.proveedor}
                    onChange={e => setForm({ ...form, proveedor: e.target.value })}
                    placeholder="Ferretería Central" className={field} />
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
                  {loading ? "Guardando..." : "Registrar Gasto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
