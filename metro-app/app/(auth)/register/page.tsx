import type { Metadata } from "next";
import { RegisterForm } from "@/components/layout/register-form";

export const metadata: Metadata = {
  title: "Registro | Metro de Medellín",
};

/**
 * Página de registro de usuario
 * Server Component que renderiza el formulario de registro
 */
export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-metro-green">Crear Cuenta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Regístrate para gestionar tu Tarjeta Cívica
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
