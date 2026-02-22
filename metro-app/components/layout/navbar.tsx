"use client";

/**
 * Barra de navegación principal
 * Client Component: maneja el estado de sesión y menú móvil
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Enlaces de navegación del menú principal */
const navLinks = [
  { href: "/rutas", label: "Rutas", color: "text-metro-blue" },
  { href: "/mapa", label: "Mapa", color: "text-metro-orange" },
  { href: "/tarjeta", label: "Tarjeta Cívica", color: "text-metro-purple" },
  { href: "/alertas", label: "Alertas", color: "text-metro-red" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-metro-green">
          Metro de Medellín
        </Link>

        {/* Enlaces de navegación */}
        <div className="hidden gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === link.href
                  ? link.color
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Botones de sesión */}
        <div className="flex gap-2">
          <Link
            href="/login"
            className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-accent"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}
