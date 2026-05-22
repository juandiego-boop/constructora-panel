import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "constructora-panel-secret-key-2024"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dejar pasar: assets, rutas de auth y TODAS las rutas /api/*
  // Las APIs son internas — no necesitan protección de middleware
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/login")
  ) {
    return NextResponse.next();
  }

  // Solo proteger páginas HTML
  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    res.cookies.delete("auth-token");
    return res;
  }
}

export const config = {
  // Solo corre en páginas, no en assets ni API
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
