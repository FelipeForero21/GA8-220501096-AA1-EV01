/**
 * API Route - Suscripción Web Push
 * POST /api/push/subscribe - Registra una suscripción push
 * DELETE /api/push/subscribe - Elimina una suscripción push
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ratelimit } from "@/lib/redis";
import type { ApiResponse } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await ratelimit.limit(`push:${ip}`);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Demasiadas peticiones." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { success: false, error: "Datos de suscripción inválidos" },
        { status: 400 }
      );
    }

    // Guardar o actualizar suscripción en la base de datos
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Suscripción registrada exitosamente",
    });
  } catch (error) {
    console.error("Error en POST /api/push/subscribe:", error);
    return NextResponse.json(
      { success: false, error: "Error registrando suscripción" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: "Endpoint es requerido" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.delete({
      where: { endpoint },
    });

    return NextResponse.json({
      success: true,
      message: "Suscripción eliminada",
    });
  } catch (error) {
    console.error("Error en DELETE /api/push/subscribe:", error);
    return NextResponse.json({
      success: true,
      message: "Suscripción no encontrada o ya eliminada",
    });
  }
}
