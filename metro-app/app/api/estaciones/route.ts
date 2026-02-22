/**
 * API Route - Estaciones del Metro
 * GET /api/estaciones - Lista todas las estaciones con su línea
 * GET /api/estaciones?lineId=xxx - Filtra por línea específica
 */

import { NextRequest, NextResponse } from "next/server";
import { ratelimit } from "@/lib/redis";
import { getAllStations, getStationsByLine } from "@/services/station.service";
import type { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Rate limiting por IP
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await ratelimit.limit(`estaciones:${ip}`);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Demasiadas peticiones. Intenta más tarde." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get("lineId");

    // Obtener estaciones filtradas o todas
    const stations = lineId
      ? await getStationsByLine(lineId)
      : await getAllStations();

    return NextResponse.json({
      success: true,
      data: stations,
    });
  } catch (error) {
    console.error("Error en GET /api/estaciones:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
