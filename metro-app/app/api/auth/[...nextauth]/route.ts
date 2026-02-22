/**
 * API Route de NextAuth.js
 * Maneja todas las rutas de autenticación (/api/auth/*)
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
