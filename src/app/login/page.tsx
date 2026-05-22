"use client";

import { Suspense, useState } from "react";
import { Building2, Loader2, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

/* ─── Formulario separado para poder envolverlo en Suspense ─── */
function LoginForm() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const router                = useRouter();
  const searchParams          = useSearchParams();
  const from                  = searchParams.get("from") ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Error al iniciar sesión");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5276]/30 focus:border-[#1a5276] pl-11";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Iniciar sesión</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="email"
            required
            placeholder="Email de administrador"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className={field}
            autoComplete="email"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className={field}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1a5276] text-white py-3 rounded-lg font-semibold hover:bg-[#154360] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
          ) : (
            "Entrar al sistema"
          )}
        </button>
      </form>
    </div>
  );
}

/* ─── Page principal ─── */
export default function LoginPage() {
  return (
    <div className="fixed inset-0 bg-gray-50 z-[9999] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1a5276] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CONSTRUCTORA</h1>
          <p className="text-sm text-gray-500 mt-1">Panel de Gestión Interno</p>
        </div>

        {/* Suspense requerido por useSearchParams en Next.js 14 */}
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#1a5276]" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-gray-400 mt-6">
          Panel interno · Acceso restringido
        </p>
      </div>
    </div>
  );
}
