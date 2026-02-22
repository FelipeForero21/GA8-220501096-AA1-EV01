import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

/** Metadatos globales de la aplicación */
export const metadata: Metadata = {
  title: "Metro de Medellín",
  description:
    "Aplicación web del Metro de Medellín - Consulta rutas, horarios, mapa interactivo y gestiona tu Tarjeta Cívica",
  keywords: ["metro", "medellín", "transporte", "rutas", "tarjeta cívica"],
};

/**
 * Layout raíz de la aplicación
 * Aplica la fuente global y envuelve toda la app
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
