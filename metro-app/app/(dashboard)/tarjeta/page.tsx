import type { Metadata } from "next";
import { CardBalance } from "@/components/tarjeta/card-balance";

export const metadata: Metadata = {
  title: "Tarjeta Cívica | Metro de Medellín",
  description: "Consulta el saldo de tu Tarjeta Cívica del Metro de Medellín",
};

/**
 * Página principal de Tarjeta Cívica
 * Muestra las tarjetas del usuario con saldo y acciones rápidas
 */
export default function TarjetaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Tarjeta Cívica</h1>
        <p className="mt-2 text-muted-foreground">
          Consulta tu saldo, historial de viajes y realiza recargas.
        </p>
      </div>
      <CardBalance />
    </div>
  );
}
