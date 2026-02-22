/**
 * API Route - Recarga de Tarjeta Cívica
 * POST /api/tarjeta/recarga - Procesa recarga con pasarela de pago
 * Requiere autenticación. Valida monto con Zod.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ratelimit } from "@/lib/redis";
import { rechargeSchema } from "@/lib/validators";
import { rechargeCard } from "@/services/card.service";
import { processPayment } from "@/services/payment.service";
import type { ApiResponse } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // Rate limiting estricto para operaciones de pago
    const { success: rateLimitOk } = await ratelimit.limit(
      `recarga:${session.user.id}`
    );
    if (!rateLimitOk) {
      return NextResponse.json(
        { success: false, error: "Demasiados intentos de recarga. Espera un momento." },
        { status: 429 }
      );
    }

    // Validar cuerpo con Zod
    const body = await request.json();
    const parsed = rechargeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { cardId, amount } = parsed.data;

    // 1. Procesar pago con la pasarela externa
    const payment = await processPayment(cardId, amount);
    if (payment.status !== "completed") {
      return NextResponse.json(
        {
          success: false,
          error: "El pago no pudo ser procesado. Verifica tu método de pago.",
          data: { transactionId: payment.transactionId },
        },
        { status: 402 }
      );
    }

    // 2. Recargar saldo en base de datos (transacción atómica)
    const updatedCard = await rechargeCard(cardId, session.user.id, amount);

    return NextResponse.json({
      success: true,
      data: {
        card: updatedCard,
        transactionId: payment.transactionId,
        message: `Recarga exitosa. Nuevo saldo: $${Number(updatedCard.balance).toLocaleString("es-CO")}`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor";
    console.error("Error en POST /api/tarjeta/recarga:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
