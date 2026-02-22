/**
 * Middleware de Next.js
 * Protege las rutas /dashboard/* requiriendo autenticación
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/register");
  const isDashboardPage = req.nextUrl.pathname.startsWith("/tarjeta");

  // Redirigir a login si no está autenticado e intenta acceder al dashboard
  if (isDashboardPage && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirigir al dashboard si ya está autenticado e intenta acceder a auth
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/tarjeta", req.url));
  }

  return NextResponse.next();
});

// Configurar qué rutas pasan por el middleware
export const config = {
  matcher: ["/tarjeta/:path*", "/login", "/register"],
};
