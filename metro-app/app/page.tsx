import Link from "next/link";

/**
 * Página principal - Landing del Metro de Medellín
 * Server Component por defecto
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-metro-green/5 to-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-metro-green">
          Metro de Medellín
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Planifica tu viaje, consulta rutas y horarios, gestiona tu Tarjeta
          Cívica y recibe alertas en tiempo real.
        </p>

        {/* Accesos rápidos */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/rutas"
            className="rounded-lg border bg-card p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-metro-blue">
              Rutas y Horarios
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Busca la mejor ruta entre estaciones
            </p>
          </Link>

          <Link
            href="/mapa"
            className="rounded-lg border bg-card p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-metro-orange">
              Mapa Interactivo
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explora la red del metro visualmente
            </p>
          </Link>

          <Link
            href="/tarjeta"
            className="rounded-lg border bg-card p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-metro-purple">
              Tarjeta Cívica
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Consulta saldo, historial y recarga
            </p>
          </Link>

          <Link
            href="/alertas"
            className="rounded-lg border bg-card p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-metro-red">
              Alertas
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Notificaciones en tiempo real
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
