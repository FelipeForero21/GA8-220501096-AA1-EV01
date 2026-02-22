/**
 * API Route - Búsqueda de rutas entre estaciones
 * GET /api/rutas?originId=xxx&destId=xxx
 *
 * Ejecuta BFS para encontrar la ruta más corta.
 * Incluye rate limiting y validación con Zod.
 */

import { NextRequest, NextResponse } from "next/server";
import { searchRouteSchema } from "@/lib/validators";
import { ratelimit } from "@/lib/redis";
import { findRoute, getOperatingHours } from "@/services/route.service";
import type { ApiResponse, RouteResult } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<RouteResult>>> {
  try {
    // Rate limiting por IP del cliente
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await ratelimit.limit(`rutas:${ip}`);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Demasiadas peticiones. Intenta más tarde." },
        { status: 429 }
      );
    }

    // Extraer y validar parámetros de consulta con Zod
    const { searchParams } = new URL(request.url);
    const parsed = searchRouteSchema.safeParse({
      originId: searchParams.get("originId"),
      destId: searchParams.get("destId"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { originId, destId } = parsed.data;

    // Ejecutar BFS para encontrar la ruta
    const route = await findRoute(originId, destId);

    if (!route) {
      return NextResponse.json(
        { success: false, error: "No se encontró una ruta entre las estaciones seleccionadas." },
        { status: 404 }
      );
    }

    // Incluir horarios de operación del día
    const schedule = getOperatingHours();

    return NextResponse.json({
      success: true,
      data: { ...route, schedule },
    });
  } catch (error) {
    console.error("Error en GET /api/rutas:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
