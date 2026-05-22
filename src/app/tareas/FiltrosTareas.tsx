"use client";

import { useState, useMemo } from "react";
import Badge from "@/components/Badge";
import AccionesTareaBtn, { type Tarea } from "./AccionesTareaBtn";

const ESTADO_VARIANT: Record<string, string> = {
  pendiente:   "yellow",
  en_progreso: "blue",
  bloqueada:   "red",
  completada:  "green",
};
const PRIORIDAD_VARIANT: Record<string, string> = {
  critica: "red", alta: "orange", media: "yellow", baja: "gray",
};
const PRIORIDAD_ORDER: Record<string, number> = {
  critica: 0, alta: 1, media: 2, baja: 3,
};

type TareaRow = Tarea & {
  prioridad: string;
  obras?: { nombre: string; codigo_obra?: string } | null;
};

type Props = {
  tareas: TareaRow[];
  vencidasIds: string[];
};

const FILTROS = [
  { key: "todas",       label: "Todas"       },
  { key: "pendiente",   label: "Pendientes"  },
  { key: "en_progreso", label: "En progreso" },
  { key: "bloqueada",   label: "Bloqueadas"  },
  { key: "vencidas",    label: "Vencidas"    },
  { key: "completada",  label: "Completadas" },
];

function formatFecha(fecha?: string) {
  if (!fecha) return null;
  return new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function FiltrosTareas({ tareas: tareasInicial, vencidasIds: _vencidasIniciales }: Props) {
  const [tareas, setTareas] = useState<TareaRow[]>(tareasInicial);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  // Calcula vencidas localmente (sin depender del servidor)
  const hoy = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const vencidasIds = useMemo(() =>
    tareas.filter(t => {
      if (t.estado === "completada" || !t.fecha_fin_plan) return false;
      return new Date(t.fecha_fin_plan + "T00:00:00") < hoy;
    }).map(t => t.id),
    [tareas, hoy]
  );
  const vSet = new Set(vencidasIds);

  const handleUpdate = (id: string, changes: Partial<TareaRow>) => {
    setTareas(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));
  };
  const handleDelete = (id: string) => {
    setTareas(prev => prev.filter(t => t.id !== id));
  };

  const tareasFiltradas = useMemo(() => {
    let lista = tareas;

    // Filtro por estado
    if (filtro === "vencidas")        lista = lista.filter(t => vSet.has(t.id));
    else if (filtro !== "todas")      lista = lista.filter(t => t.estado === filtro);

    // Búsqueda por nombre
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(t =>
        t.nombre.toLowerCase().includes(q) ||
        t.obras?.nombre?.toLowerCase().includes(q)
      );
    }

    // Ordenar: prioridad → fecha
    return [...lista].sort((a, b) => {
      if (a.estado === "completada" && b.estado !== "completada") return 1;
      if (b.estado === "completada" && a.estado !== "completada") return -1;
      const pa = PRIORIDAD_ORDER[a.prioridad] ?? 9;
      const pb = PRIORIDAD_ORDER[b.prioridad] ?? 9;
      if (pa !== pb) return pa - pb;
      if (!a.fecha_fin_plan) return 1;
      if (!b.fecha_fin_plan) return -1;
      return new Date(a.fecha_fin_plan).getTime() - new Date(b.fecha_fin_plan).getTime();
    });
  }, [tareas, filtro, busqueda, vencidasIds]);

  const counts: Record<string, number> = useMemo(() => ({
    todas:       tareas.length,
    pendiente:   tareas.filter(t => t.estado === "pendiente").length,
    en_progreso: tareas.filter(t => t.estado === "en_progreso").length,
    bloqueada:   tareas.filter(t => t.estado === "bloqueada").length,
    vencidas:    vencidasIds.length,
    completada:  tareas.filter(t => t.estado === "completada").length,
  }), [tareas, vencidasIds]);

  return (
    <div>
      {/* Barra de búsqueda + filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar tarea u obra..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276]"
        />
      </div>

      {/* Tabs de filtro */}
      <div className="flex gap-1 flex-wrap mb-4">
        {FILTROS.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtro === f.key
                ? "bg-[#1a5276] text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              filtro === f.key ? "bg-white/20" : "bg-gray-200 text-gray-500"
            }`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">Tarea</th>
                <th className="px-4 py-3">Obra</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Avance</th>
                <th className="px-4 py-3">Prioridad</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tareasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                    No hay tareas en esta categoría.
                  </td>
                </tr>
              ) : tareasFiltradas.map(t => {
                const hoy      = new Date();
                const vence    = t.fecha_fin_plan ? new Date(t.fecha_fin_plan + "T00:00:00") : null;
                const vencida  = vSet.has(t.id);
                const diasRest = vence ? Math.ceil((vence.getTime() - hoy.getTime()) / 86400000) : null;
                const avance   = t.porcentaje_avance ?? 0;
                const esCom    = t.estado === "completada";

                return (
                  <tr key={t.id} className={`hover:bg-gray-50/60 transition-colors ${vencida && !esCom ? "bg-red-50/20" : ""} ${esCom ? "opacity-60" : ""}`}>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className={`font-medium ${esCom ? "line-through text-gray-400" : vencida ? "text-red-700" : "text-gray-900"}`}>
                        {t.nombre}
                      </p>
                      {t.descripcion && !esCom && (
                        <p className="text-xs text-gray-400 truncate">{t.descripcion}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {t.obras ? (
                        <>
                          {t.obras.codigo_obra && <span className="font-mono text-gray-400">[{t.obras.codigo_obra}] </span>}
                          {t.obras.nombre}
                        </>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      {vence ? (
                        <div>
                          <p className={`text-xs font-medium ${vencida && !esCom ? "text-red-600" : diasRest! <= 3 && !esCom ? "text-orange-500" : "text-gray-500"}`}>
                            {formatFecha(t.fecha_fin_plan)}
                          </p>
                          {!esCom && diasRest !== null && (
                            <p className={`text-[10px] ${vencida ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                              {vencida ? `Vencida hace ${Math.abs(diasRest)}d` : `${diasRest}d restantes`}
                            </p>
                          )}
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${avance >= 100 ? "bg-green-500" : avance >= 50 ? "bg-blue-500" : "bg-yellow-400"}`}
                            style={{ width: `${avance}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{avance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={PRIORIDAD_VARIANT[t.prioridad] ?? "gray"} className="capitalize text-[11px]">
                        {t.prioridad ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={ESTADO_VARIANT[t.estado] ?? "gray"} className="capitalize text-[11px]">
                        {t.estado?.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <AccionesTareaBtn tarea={t} onUpdate={handleUpdate} onDelete={handleDelete} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2 border-t border-gray-50 text-xs text-gray-400">
          {tareasFiltradas.length} de {tareas.length} tareas
        </div>
      </div>
    </div>
  );
}
