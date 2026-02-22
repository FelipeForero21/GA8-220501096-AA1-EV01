/**
 * Servicio de Alertas
 * Patrón Repository: gestiona alertas del sistema metro
 */

import { prisma } from "@/lib/prisma";
import type { Alert } from "@prisma/client";

/**
 * Obtiene todas las alertas activas
 * @returns Lista de alertas activas ordenadas por severidad y fecha
 */
export async function getActiveAlerts(): Promise<Alert[]> {
  return prisma.alert.findMany({
    where: {
      active: true,
      OR: [
        { endsAt: null },
        { endsAt: { gte: new Date() } },
      ],
    },
    include: {
      station: true,
      line: true,
    },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
  });
}

/**
 * Crea una nueva alerta en el sistema
 * @param data - Datos de la alerta a crear
 * @returns Alerta creada
 */
export async function createAlert(data: {
  title: string;
  description: string;
  type: "DELAY" | "CLOSURE" | "MAINTENANCE" | "GENERAL";
  severity: "INFO" | "WARNING" | "CRITICAL";
  stationId?: string;
  lineId?: string;
  startsAt: Date;
  endsAt?: Date;
}): Promise<Alert> {
  return prisma.alert.create({ data });
}

/**
 * Desactiva una alerta existente
 * @param alertId - ID de la alerta a desactivar
 * @returns Alerta actualizada
 */
export async function deactivateAlert(alertId: string): Promise<Alert> {
  return prisma.alert.update({
    where: { id: alertId },
    data: { active: false },
  });
}
