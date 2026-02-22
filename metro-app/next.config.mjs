/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar modo estricto de React para detectar problemas
  reactStrictMode: true,

  // Configuración de imágenes externas (si se necesitan)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.metrodemedellin.gov.co",
      },
    ],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
