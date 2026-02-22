/**
 * Servicio de Notificaciones Web Push
 * Envía notificaciones push a todos los suscriptores usando la Web Push API.
 * Requiere claves VAPID configuradas en las variables de entorno.
 */

import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Configurar VAPID para Web Push
if (
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@metromedellin.gov.co",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/** Payload de la notificación push */
interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

/**
 * Envía una notificación push a todos los suscriptores registrados.
 * Elimina suscripciones inválidas (endpoint expirado o revocado).
 *
 * @param payload - Datos de la notificación a enviar
 * @returns Número de notificaciones enviadas exitosamente
 */
export async function sendPushToAll(payload: PushPayload): Promise<number> {
  const subscriptions = await prisma.pushSubscription.findMany();

  let sent = 0;
  const invalidEndpoints: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload)
      );
      sent++;
    } catch (error) {
      // Si la suscripción expiró o fue revocada, marcar para eliminar
      if (
        error instanceof webpush.WebPushError &&
        (error.statusCode === 404 || error.statusCode === 410)
      ) {
        invalidEndpoints.push(sub.endpoint);
      }
    }
  }

  // Limpiar suscripciones inválidas
  if (invalidEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: invalidEndpoints } },
    });
  }

  return sent;
}

/**
 * Envía una notificación de alerta del metro a todos los suscriptores.
 *
 * @param alertTitle - Título de la alerta
 * @param alertDescription - Descripción de la alerta
 * @param severity - Nivel de severidad
 */
export async function notifyAlert(
  alertTitle: string,
  alertDescription: string,
  severity: string
): Promise<void> {
  const severityEmojis: Record<string, string> = {
    INFO: "ℹ️",
    WARNING: "⚠️",
    CRITICAL: "🚨",
  };

  const emoji = severityEmojis[severity] || "📢";

  await sendPushToAll({
    title: `${emoji} Metro Medellín: ${alertTitle}`,
    body: alertDescription,
    icon: "/icons/metro-icon.png",
    url: "/alertas",
    tag: `alert-${Date.now()}`,
  });
}
