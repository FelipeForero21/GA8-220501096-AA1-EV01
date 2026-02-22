import type { Metadata } from "next";
import { RechargeForm } from "@/components/tarjeta/recharge-form";

export const metadata: Metadata = {
  title: "Recarga | Metro de Medellín",
  description: "Recarga tu Tarjeta Cívica del Metro de Medellín de forma segura",
};

/**
 * Página de recarga de Tarjeta Cívica
 * Formulario con montos predefinidos y pasarela de pago
 */
export default function RecargaPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recargar Tarjeta</h1>
        <p className="mt-2 text-muted-foreground">
          Selecciona el monto y realiza la recarga de tu Tarjeta Cívica.
        </p>
      </div>
      <RechargeForm />
    </div>
  );
}
