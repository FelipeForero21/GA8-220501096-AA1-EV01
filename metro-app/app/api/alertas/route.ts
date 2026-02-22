/**
 * API Route - Alertas del Sistema
 * GET /api/alertas - Lista alertas activas con filtros
 * POST /api/alertas - Crea una nueva alerta (solo ADMIN)
 */

import { NextRequest, NextResponse } from "next/server";
import { createAlertSchema } from "@/lib/validators";
import { ratelimit } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { getActiveAlerts, createAlert } from "@/services/alert.service";
import type { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await ratelimit.limit(`alertas:${ip}`);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Demasiadas peticiones. Intenta más tarde." },
        { status: 429 }
      );
    }

    // Obtener alertas activas desde el servicio
    const alerts = await getActiveAlerts();

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error en GET /api/alertas:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Solo administradores pueden crear alertas
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "No autorizado. Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    // Validar cuerpo con Zod
    const body = await request.json();
    const parsed = createAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Crear la alerta en la base de datos
    const alert = await createAlert({
      ...parsed.data,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: "Alerta creada exitosamente",
    });
  } catch (error) {
    console.error("Error en POST /api/alertas:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
