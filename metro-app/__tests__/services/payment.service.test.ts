/**
 * Pruebas unitarias - Servicio de Pagos
 * Verifica el procesamiento de pagos de recarga
 */

import { processPayment } from "@/services/payment.service";

describe("PaymentService", () => {
  describe("processPayment", () => {
    it("debe completar pago con monto válido (múltiplo de 1000)", async () => {
      const result = await processPayment("card1", 10000);

      expect(result.status).toBe("completed");
      expect(result.cardId).toBe("card1");
      expect(result.amount).toBe(10000);
      expect(result.transactionId).toMatch(/^TXN-/);
    });

    it("debe fallar con monto que no es múltiplo de 1000", async () => {
      const result = await processPayment("card1", 1500);

      expect(result.status).toBe("failed");
    });

    it("debe generar un ID de transacción único", async () => {
      const result1 = await processPayment("card1", 5000);
      const result2 = await processPayment("card1", 5000);

      expect(result1.transactionId).not.toBe(result2.transactionId);
    });

    it("debe incluir el monto correcto en la respuesta", async () => {
      const result = await processPayment("card1", 50000);

      expect(result.amount).toBe(50000);
    });
  });
});
