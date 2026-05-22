"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function EliminarGastoBtn({ gastoId }: { gastoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const eliminar = async () => {
    if (!confirm("¿Eliminar este gasto? No se puede deshacer.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/gastos/${gastoId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={eliminar}
      disabled={loading}
      className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
      title="Eliminar gasto"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
