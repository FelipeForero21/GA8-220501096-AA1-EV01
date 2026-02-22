/**
 * Cliente de Prisma - Singleton
 * Evita múltiples instancias en desarrollo con hot-reload
 */

import { PrismaClient } from "@prisma/client";

// Declaración global para mantener la instancia entre hot-reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Instancia singleton del cliente de Prisma */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// En desarrollo, guardar en global para evitar múltiples conexiones
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
