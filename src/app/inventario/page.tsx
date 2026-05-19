export const dynamic = "force-dynamic";

import { supabase, formatPeso } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import NuevoMaterialBtn from "./NuevoMaterialBtn";
import { Package, AlertTriangle } from "lucide-react";



async function getInventario() {
  const { data } = await supabase
    .from("inventario")
    .select("*, materiales(nombre, codigo, unidad_medida, categoria)")
    .order("updated_at", { ascending: false });
  return data ?? [];
}

async function getStockBajo() {
  const { data } = await supabase.from("v_stock_bajo").select("*");
  return data ?? [];
}

export default async function InventarioPage() {
  const [inventario, stockBajo] = await Promise.all([getInventario(), getStockBajo()]);

  return (
    <div>
      <PageHeader
        title="Inventario"
        subtitle={`${inventario.length} materiales · ${stockBajo.length} bajo stock mínimo`}
        action={<NuevoMaterialBtn inventario={inventario} />}
      />

      {/* Alerta stock bajo */}
      {stockBajo.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">
              {stockBajo.length} material(es) bajo el stock mínimo
            </p>
            <ul className="mt-1 text-sm text-red-700 space-y-0.5">
              {stockBajo.map((m: any) => (
                <li key={m.material_id ?? m.nombre}>
                  • {m.nombre} [{m.codigo}] — Stock: {m.stock_actual}/{m.stock_minimo} {m.unidad}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Material</th>
                <th className="px-4 py-3.5">Categoría</th>
                <th className="px-4 py-3.5 text-center">Stock Actual</th>
                <th className="px-4 py-3.5 text-center">Stock Mínimo</th>
                <th className="px-4 py-3.5 text-right">Precio Unit.</th>
                <th className="px-4 py-3.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventario.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                    Sin materiales en inventario
                  </td>
                </tr>
              ) : inventario.map((item: any) => {
                const mat = item.materiales ?? {};
                const stock = item.cantidad_actual ?? 0;
                const minimo = item.stock_minimo ?? 0;
                const pct = minimo > 0 ? (stock / minimo) * 100 : 100;
                const agotado = stock === 0;
                const bajo = pct < 100 && pct > 0;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{mat.nombre ?? "—"}</p>
                      <p className="text-xs text-gray-400 font-mono">{mat.codigo ?? ""}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="blue" className="capitalize text-xs">
                        {mat.categoria?.replace(/_/g, " ") ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-gray-800">
                      {stock} <span className="text-xs font-normal text-gray-400">{mat.unidad_medida}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-gray-500">
                      {minimo} <span className="text-xs text-gray-400">{mat.unidad_medida}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-700">
                      {formatPeso(item.precio_unitario)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {agotado ? (
                        <Badge variant="red">Agotado</Badge>
                      ) : bajo ? (
                        <Badge variant="yellow">Bajo</Badge>
                      ) : (
                        <Badge variant="green">OK</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
