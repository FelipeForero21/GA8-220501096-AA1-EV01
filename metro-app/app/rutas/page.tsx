import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { RouteSearch } from "@/components/rutas/route-search";

export const metadata: Metadata = {
  title: "Rutas y Horarios | Metro de Medellín",
  description:
    "Busca la mejor ruta entre estaciones del Metro de Medellín con transbordos y tiempos estimados",
};

/**
 * Página de búsqueda de rutas y horarios
 * Server Component que renderiza el buscador interactivo de rutas
 */
export default function RutasPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-metro-blue">
              Rutas y Horarios
            </h1>
            <p className="mt-2 text-muted-foreground">
              Selecciona la estación de origen y destino para encontrar la mejor
              ruta con transbordos y tiempos estimados.
            </p>
          </div>
          <RouteSearch />
        </div>
      </main>
    </>
  );
}
