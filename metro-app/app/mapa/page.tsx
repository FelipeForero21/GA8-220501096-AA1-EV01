import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { MetroMap } from "@/components/mapa/metro-map";

export const metadata: Metadata = {
  title: "Mapa Interactivo | Metro de Medellín",
  description:
    "Explora la red del Metro de Medellín en un mapa interactivo con zoom y detalles por estación",
};

/**
 * Página del mapa interactivo
 * Server Component que renderiza el mapa SVG con zoom/paneo
 */
export default function MapaPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-metro-orange">
              Mapa Interactivo
            </h1>
            <p className="mt-2 text-muted-foreground">
              Explora la red del Metro de Medellín. Haz clic en una estación
              para ver más información. Usa los controles o el scroll para hacer
              zoom.
            </p>
          </div>
          <MetroMap />
        </div>
      </main>
    </>
  );
}
