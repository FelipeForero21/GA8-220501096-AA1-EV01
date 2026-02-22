import type { Metadata } from "next";
import { LoginForm } from "@/components/layout/login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Metro de Medellín",
};

/**
 * Página de inicio de sesión
 * Server Component que renderiza el formulario de login
 */
export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-metro-green">Iniciar Sesión</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accede a tu cuenta para gestionar tu Tarjeta Cívica
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
