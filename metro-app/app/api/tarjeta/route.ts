/**
 * API Route - Tarjeta Cívica
 * GET /api/tarjeta - Obtiene las tarjetas del usuario autenticado
 * Requiere autenticación (sesión activa)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ratelimit } from "@/lib/redis";
import { getCardsByUserId } from "@/services/card.service";
import type { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autenticado. Inicia sesión para continuar." },
        { status: 401 }
      );
    }

    // Rate limiting por usuario
    const { success } = await ratelimit.limit(`tarjeta:${session.user.id}`);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Demasiadas peticiones. Intenta más tarde." },
        { status: 429 }
      );
    }

    // Obtener tarjetas del usuario
    const cards = await getCardsByUserId(session.user.id);

    return NextResponse.json({
      success: true,
      data: cards,
    });
  } catch (error) {
    console.error("Error en GET /api/tarjeta:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
