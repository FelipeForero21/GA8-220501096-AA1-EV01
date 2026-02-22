/**
 * Servicio de Pasarela de Pago
 * Simula la integración con un proveedor de pagos externo.
 * En producción, se reemplazaría por la integración real (ej: Stripe, PayU).
 */

import type { PaymentInfo } from "@/types";

/**
 * Procesa un pago de recarga de tarjeta.
 * Simula la comunicación con la pasarela de pago externa.
 *
 * @param cardId - ID de la tarjeta a recargar
 * @param amount - Monto de la recarga en COP
 * @returns Información del pago procesado
 * @throws Error si el pago falla
 */
export async function processPayment(
  cardId: string,
  amount: number
): Promise<PaymentInfo> {
  // Generar ID de transacción único
  const transactionId = `TXN-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;

  // Simular latencia de la pasarela (200-500ms)
  await new Promise((resolve) =>
    setTimeout(resolve, 200 + Math.random() * 300)
  );

  // Simular validación de pago (en producción: llamar al API de la pasarela)
  // Rechazar montos que no sean múltiplos de 1000 como regla de negocio
  if (amount % 1000 !== 0) {
    return {
      cardId,
      amount,
      transactionId,
      status: "failed",
    };
  }

  return {
    cardId,
    amount,
    transactionId,
    status: "completed",
  };
}

/**
 * Consulta el estado de una transacción existente.
 *
 * @param transactionId - ID de la transacción a consultar
 * @returns Estado actual del pago
 */
export async function getPaymentStatus(
  transactionId: string
): Promise<PaymentInfo["status"]> {
  // En producción: consultar el estado real al proveedor
  console.log(`Consultando estado de transacción: ${transactionId}`);
  return "completed";
}
