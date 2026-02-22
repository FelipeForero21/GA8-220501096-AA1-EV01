/**
 * API Route - Server-Sent Events (SSE) para alertas en tiempo real
 * GET /api/alertas/sse
 *
 * Establece una conexión SSE que envía alertas nuevas cada 10 segundos.
 * El cliente se suscribe y recibe actualizaciones automáticamente.
 */

import { NextRequest } from "next/server";
import { getActiveAlerts } from "@/services/alert.service";

/** Intervalo de polling para nuevas alertas (ms) */
const POLL_INTERVAL = 10000;

export async function GET(request: NextRequest) {
  // Crear un TransformStream para SSE
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Función para enviar un evento SSE
  async function sendEvent(data: unknown, event: string = "alert") {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    await writer.write(encoder.encode(message));
  }

  // Variable para controlar el cierre de la conexión
  let isConnected = true;

  // Detectar desconexión del cliente
  request.signal.addEventListener("abort", () => {
    isConnected = false;
  });

  // Enviar alertas iniciales y luego hacer polling
  (async () => {
    try {
      // Enviar evento de conexión establecida
      await sendEvent({ connected: true, timestamp: new Date().toISOString() }, "connected");

      // Enviar alertas activas inmediatamente
      const initialAlerts = await getActiveAlerts();
      await sendEvent(initialAlerts, "alerts");

      // Polling periódico para nuevas alertas
      let lastAlertCount = initialAlerts.length;

      while (isConnected) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

        if (!isConnected) break;

        try {
          const currentAlerts = await getActiveAlerts();

          // Enviar solo si hay cambios (nueva alerta o alerta desactivada)
          if (currentAlerts.length !== lastAlertCount) {
            await sendEvent(currentAlerts, "alerts");
            lastAlertCount = currentAlerts.length;
          }

          // Heartbeat para mantener la conexión viva
          await sendEvent({ timestamp: new Date().toISOString() }, "heartbeat");
        } catch {
          // Si hay error en la consulta, enviar heartbeat igualmente
          await sendEvent({ timestamp: new Date().toISOString() }, "heartbeat");
        }
      }
    } catch {
      // La conexión se cerró
    } finally {
      try {
        await writer.close();
      } catch {
        // Writer ya cerrado
      }
    }
  })();

  // Retornar la respuesta SSE
  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
