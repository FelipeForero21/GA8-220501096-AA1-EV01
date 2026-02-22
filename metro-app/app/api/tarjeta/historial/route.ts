/**
 * API Route - Historial de viajes
 * GET /api/tarjeta/historial?cardId=xxx&page=1
 * Requiere autenticación. Retorna viajes paginados.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ratelimit } from "@/lib/redis";
import { getTripHistory, getTripCount, getCardByIdForUser } from "@/services/card.service";
import type { ApiResponse } from "@/types";

const PAGE_SIZE = 10;

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { success } = await ratelimit.limit(`historial:${session.user.id}`);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Demasiadas peticiones." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

    if (!cardId) {
      return NextResponse.json(
        { success: false, error: "cardId es requerido" },
        { status: 400 }
      );
    }

    // Verificar que la tarjeta pertenezca al usuario
    const card = await getCardByIdForUser(cardId, session.user.id);
    if (!card) {
      return NextResponse.json(
        { success: false, error: "Tarjeta no encontrada" },
        { status: 404 }
      );
    }

    const offset = (page - 1) * PAGE_SIZE;
    const [trips, total] = await Promise.all([
      getTripHistory(cardId, PAGE_SIZE, offset),
      getTripCount(cardId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        trips,
        pagination: {
          page,
          pageSize: PAGE_SIZE,
          total,
          totalPages: Math.ceil(total / PAGE_SIZE),
        },
      },
    });
  } catch (error) {
    console.error("Error en GET /api/tarjeta/historial:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
