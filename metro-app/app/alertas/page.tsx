import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { AlertList } from "@/components/alertas/alert-list";
import { PushToggle } from "@/components/alertas/push-toggle";

export const metadata: Metadata = {
  title: "Alertas | Metro de Medellín",
  description:
    "Alertas en tiempo real sobre retrasos, cierres y mantenimiento del Metro de Medellín",
};

/**
 * Página de alertas y notificaciones del sistema
 * Muestra alertas activas en tiempo real vía SSE con opción de Web Push
 */
export default function AlertasPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-metro-red">
              Alertas del Sistema
            </h1>
            <p className="mt-2 text-muted-foreground">
              Información en tiempo real sobre retrasos, cierres y
              mantenimiento de la red del metro.
            </p>
          </div>

          {/* Activar/desactivar notificaciones push */}
          <PushToggle />

          {/* Lista de alertas en tiempo real (SSE) */}
          <AlertList />
        </div>
      </main>
    </>
  );
}
