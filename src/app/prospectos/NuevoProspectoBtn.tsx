"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const TIPOS = ["casa_nueva", "remodelacion", "ampliacion", "acabados", "diseno", "otro"];
const FUENTES = ["web", "referido", "instagram", "facebook", "whatsapp", "llamada", "feria", "otro"];

export default function NuevoProspectoBtn() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "", telefono: "", email: "", ciudad: "",
    tipo_proyecto: "casa_nueva", fuente: "web",
    presupuesto_estimado: "", notas: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_N8N_URL ?? "https://n8n-n8n.g6kmjk.easypanel.host"}/webhook/captar-lead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: form.nombre,
            telefono: form.telefono,
            email: form.email || undefined,
            ciudad: form.ciudad || undefined,
            tipo_proyecto: form.tipo_proyecto,
            fuente: form.fuente,
            presupuesto_estimado: form.presupuesto_estimado
              ? Number(form.presupuesto_estimado)
              : undefined,
            notas: form.notas || undefined,
          }),
        }
      );
      if (res.ok) {
        setOpen(false);
        setForm({ nombre: "", telefono: "", email: "", ciudad: "", tipo_proyecto: "casa_nueva", fuente: "web", presupuesto_estimado: "", notas: "" });
        router.refresh();
      } else {
        alert("Error al guardar prospecto. Revisa la consola.");
      }
    } catch {
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[#1a5276] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#154360] transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" /> Nuevo Prospecto
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg">Nuevo Prospecto</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    required
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: María González"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Teléfono *</label>
                  <input
                    required
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })}
                    placeholder="3001234567"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ciudad</label>
                  <input
                    value={form.ciudad}
                    onChange={e => setForm({ ...form, ciudad: e.target.value })}
                    placeholder="Bogotá"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@email.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de proyecto</label>
                  <select
                    value={form.tipo_proyecto}
                    onChange={e => setForm({ ...form, tipo_proyecto: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276] bg-white"
                  >
                    {TIPOS.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fuente</label>
                  <select
                    value={form.fuente}
                    onChange={e => setForm({ ...form, fuente: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276] bg-white"
                  >
                    {FUENTES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Presupuesto estimado (COP)
                  </label>
                  <input
                    type="number"
                    value={form.presupuesto_estimado}
                    onChange={e => setForm({ ...form, presupuesto_estimado: e.target.value })}
                    placeholder="150000000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Notas</label>
                  <textarea
                    rows={3}
                    value={form.notas}
                    onChange={e => setForm({ ...form, notas: e.target.value })}
                    placeholder="Información adicional del prospecto..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#1a5276] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#154360] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {loading ? "Guardando..." : "Guardar Prospecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
