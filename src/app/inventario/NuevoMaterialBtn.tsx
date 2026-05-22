"use client";

import { useState } from "react";
import { Plus, X, Loader2, RefreshCw } from "lucide-react";

const CATEGORIAS = [
  "concreto", "acero", "madera", "acabados",
  "instalaciones", "herramientas", "equipos", "otro",
];

const UNIDADES = ["kg", "ton", "m²", "m³", "ml", "unidad", "litros", "bolsa", "rollo", "caja"];

type InventarioItem = {
  id: string;
  cantidad_disponible: number;   // columna real en DB
  materiales?: { nombre: string; codigo?: string; unidad_medida: string; stock_minimo?: number; precio_unitario_referencia?: number };
};

type Props = { inventario: InventarioItem[] };

export default function NuevoMaterialBtn({ inventario }: Props) {
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState<"nuevo" | "ajustar">("nuevo");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // ── Formulario Nuevo Material ────────────────────────────────────────────────
  const [formNuevo, setFormNuevo] = useState({
    nombre: "", codigo: "", categoria: "materiales",
    unidad_medida: "unidad", descripcion: "",
    cantidad_actual: "0", stock_minimo: "0", precio_unitario: "", ubicacion: "",
  });

  // ── Formulario Ajustar Stock ─────────────────────────────────────────────────
  const [formAjuste, setFormAjuste] = useState({
    inventario_id: "", cantidad_actual: "", stock_minimo: "", precio_unitario: "",
  });

  const field = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276]";

  const resetAndClose = () => {
    setOpen(false);
    setError("");
    setSuccess("");
    setFormNuevo({ nombre: "", codigo: "", categoria: "materiales", unidad_medida: "unidad", descripcion: "", cantidad_actual: "0", stock_minimo: "0", precio_unitario: "", ubicacion: "" });
    setFormAjuste({ inventario_id: "", cantidad_actual: "", stock_minimo: "", precio_unitario: "" });
  };

  const handleNuevo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:          formNuevo.nombre,
          codigo:          formNuevo.codigo          || undefined,
          categoria:       formNuevo.categoria,
          unidad_medida:   formNuevo.unidad_medida,
          descripcion:     formNuevo.descripcion     || undefined,
          cantidad_actual: Number(formNuevo.cantidad_actual),
          stock_minimo:    Number(formNuevo.stock_minimo),
          precio_unitario: formNuevo.precio_unitario ? Number(formNuevo.precio_unitario) : undefined,
          ubicacion:       formNuevo.ubicacion       || undefined,
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

  const handleAjuste = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const body: Record<string, unknown> = { inventario_id: formAjuste.inventario_id };
      if (formAjuste.cantidad_actual !== "") body.cantidad_actual = Number(formAjuste.cantidad_actual);
      if (formAjuste.stock_minimo   !== "") body.stock_minimo    = Number(formAjuste.stock_minimo);
      if (formAjuste.precio_unitario !== "") body.precio_unitario = Number(formAjuste.precio_unitario);

      const res = await fetch("/api/inventario", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Error al ajustar"); return; }
      setOpen(false);
      window.location.reload();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Cuando seleccionan un material para ajustar, pre-cargar valores actuales
  const onSelectMaterial = (id: string) => {
    const item = inventario.find(i => i.id === id);
    setFormAjuste({
      inventario_id:   id,
      cantidad_actual: item ? String(item.cantidad_disponible) : "",
      stock_minimo:    item?.materiales?.stock_minimo ? String(item.materiales.stock_minimo) : "",
      precio_unitario: item?.materiales?.precio_unitario_referencia ? String(item.materiales.precio_unitario_referencia) : "",
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => { setTab("nuevo"); setOpen(true); }}
          className="flex items-center gap-2 bg-[#1a5276] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#154360] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Material
        </button>
        <button
          onClick={() => { setTab("ajustar"); setOpen(true); }}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Ajustar Stock
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header con tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => { setTab("nuevo"); setError(""); setSuccess(""); }}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === "nuevo" ? "bg-white text-[#1a5276] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Nuevo Material
                </button>
                <button
                  onClick={() => { setTab("ajustar"); setError(""); setSuccess(""); }}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${tab === "ajustar" ? "bg-white text-[#1a5276] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Ajustar Stock
                </button>
              </div>
              <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>
              )}

              {/* ── TAB: NUEVO MATERIAL ──────────────────────────────────── */}
              {tab === "nuevo" && (
                <form onSubmit={handleNuevo} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre del material *</label>
                      <input required value={formNuevo.nombre}
                        onChange={e => setFormNuevo({ ...formNuevo, nombre: e.target.value })}
                        placeholder="Ej: Cemento Portland 50kg" className={field} />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Código</label>
                      <input value={formNuevo.codigo}
                        onChange={e => setFormNuevo({ ...formNuevo, codigo: e.target.value })}
                        placeholder="MAT-001" className={field} />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría *</label>
                      <select value={formNuevo.categoria}
                        onChange={e => setFormNuevo({ ...formNuevo, categoria: e.target.value })}
                        className={`${field} bg-white`}>
                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Unidad de medida *</label>
                      <select value={formNuevo.unidad_medida}
                        onChange={e => setFormNuevo({ ...formNuevo, unidad_medida: e.target.value })}
                        className={`${field} bg-white`}>
                        {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Precio unitario (COP)</label>
                      <input type="number" value={formNuevo.precio_unitario}
                        onChange={e => setFormNuevo({ ...formNuevo, precio_unitario: e.target.value })}
                        placeholder="45000" className={field} />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Stock inicial</label>
                      <input type="number" min="0" value={formNuevo.cantidad_actual}
                        onChange={e => setFormNuevo({ ...formNuevo, cantidad_actual: e.target.value })}
                        className={field} />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Stock mínimo</label>
                      <input type="number" min="0" value={formNuevo.stock_minimo}
                        onChange={e => setFormNuevo({ ...formNuevo, stock_minimo: e.target.value })}
                        className={field} />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Ubicación en bodega</label>
                      <input value={formNuevo.ubicacion}
                        onChange={e => setFormNuevo({ ...formNuevo, ubicacion: e.target.value })}
                        placeholder="Ej: Bodega A, Estante 3" className={field} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={resetAndClose}
                      className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 bg-[#1a5276] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#154360] flex items-center justify-center gap-2 disabled:opacity-60">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      {loading ? "Guardando..." : "Agregar Material"}
                    </button>
                  </div>
                </form>
              )}

              {/* ── TAB: AJUSTAR STOCK ───────────────────────────────────── */}
              {tab === "ajustar" && (
                <form onSubmit={handleAjuste} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Material *</label>
                      <select required value={formAjuste.inventario_id}
                        onChange={e => onSelectMaterial(e.target.value)}
                        className={`${field} bg-white`}>
                        <option value="">— Selecciona un material —</option>
                        {inventario.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.materiales?.codigo ? `[${item.materiales.codigo}] ` : ""}
                            {item.materiales?.nombre ?? item.id}
                            {" "}— Stock: {item.cantidad_disponible} {item.materiales?.unidad_medida}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nuevo stock actual</label>
                      <input type="number" min="0" value={formAjuste.cantidad_actual}
                        onChange={e => setFormAjuste({ ...formAjuste, cantidad_actual: e.target.value })}
                        placeholder="Cantidad actual" className={field} />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Stock mínimo</label>
                      <input type="number" min="0" value={formAjuste.stock_minimo}
                        onChange={e => setFormAjuste({ ...formAjuste, stock_minimo: e.target.value })}
                        placeholder="Stock mínimo" className={field} />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Precio unitario (COP)</label>
                      <input type="number" value={formAjuste.precio_unitario}
                        onChange={e => setFormAjuste({ ...formAjuste, precio_unitario: e.target.value })}
                        placeholder="Precio por unidad" className={field} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={resetAndClose}
                      className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loading || !formAjuste.inventario_id}
                      className="flex-1 bg-[#1a5276] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#154360] flex items-center justify-center gap-2 disabled:opacity-60">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {loading ? "Actualizando..." : "Actualizar Stock"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
