import type { Metadata } from "next";
import { TripHistory } from "@/components/tarjeta/trip-history";

export const metadata: Metadata = {
  title: "Historial de Viajes | Metro de Medellín",
  description: "Revisa el historial de viajes de tu Tarjeta Cívica",
};

/**
 * Página del historial de viajes
 * Muestra tabla paginada de viajes realizados
 */
export default function HistorialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial de Viajes</h1>
        <p className="mt-2 text-muted-foreground">
          Revisa todos los viajes realizados con tu Tarjeta Cívica.
        </p>
      </div>
      <TripHistory />
    </div>
  );
}
