/**
 * Layout para las páginas de autenticación (login/registro)
 * Centra el contenido en la pantalla
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-metro-green/5 to-white px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
