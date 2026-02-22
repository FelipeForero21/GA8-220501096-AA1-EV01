/**
 * Pruebas unitarias - Validadores Zod
 * Verifica que los esquemas acepten datos válidos y rechacen inválidos
 */

import {
  registerSchema,
  loginSchema,
  searchRouteSchema,
  rechargeSchema,
  createAlertSchema,
} from "@/lib/validators";

describe("Validators", () => {
  describe("registerSchema", () => {
    it("debe aceptar datos válidos", () => {
      const result = registerSchema.safeParse({
        name: "Juan Pérez",
        email: "juan@test.com",
        password: "Password1",
      });
      expect(result.success).toBe(true);
    });

    it("debe rechazar email inválido", () => {
      const result = registerSchema.safeParse({
        name: "Juan",
        email: "no-es-email",
        password: "Password1",
      });
      expect(result.success).toBe(false);
    });

    it("debe rechazar contraseña sin mayúscula", () => {
      const result = registerSchema.safeParse({
        name: "Juan",
        email: "juan@test.com",
        password: "password1",
      });
      expect(result.success).toBe(false);
    });

    it("debe rechazar contraseña corta (< 8 caracteres)", () => {
      const result = registerSchema.safeParse({
        name: "Juan",
        email: "juan@test.com",
        password: "Pass1",
      });
      expect(result.success).toBe(false);
    });

    it("debe rechazar nombre corto (< 2 caracteres)", () => {
      const result = registerSchema.safeParse({
        name: "J",
        email: "juan@test.com",
        password: "Password1",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("debe aceptar credenciales válidas", () => {
      const result = loginSchema.safeParse({
        email: "juan@test.com",
        password: "mipassword",
      });
      expect(result.success).toBe(true);
    });

    it("debe rechazar contraseña vacía", () => {
      const result = loginSchema.safeParse({
        email: "juan@test.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("searchRouteSchema", () => {
    it("debe aceptar IDs CUID válidos", () => {
      const result = searchRouteSchema.safeParse({
        originId: "clx1234567890abcdefghijk",
        destId: "clx0987654321zyxwvutsrqp",
      });
      expect(result.success).toBe(true);
    });

    it("debe rechazar IDs inválidos", () => {
      const result = searchRouteSchema.safeParse({
        originId: "not-a-cuid",
        destId: "also-invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("rechargeSchema", () => {
    it("debe aceptar monto válido", () => {
      const result = rechargeSchema.safeParse({
        cardId: "clx1234567890abcdefghijk",
        amount: 10000,
      });
      expect(result.success).toBe(true);
    });

    it("debe rechazar monto menor a $2.000", () => {
      const result = rechargeSchema.safeParse({
        cardId: "clx1234567890abcdefghijk",
        amount: 1000,
      });
      expect(result.success).toBe(false);
    });

    it("debe rechazar monto mayor a $200.000", () => {
      const result = rechargeSchema.safeParse({
        cardId: "clx1234567890abcdefghijk",
        amount: 300000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createAlertSchema", () => {
    it("debe aceptar alerta válida", () => {
      const result = createAlertSchema.safeParse({
        title: "Retraso en Línea A",
        description: "Retraso de 10 minutos en la Línea A por falla técnica",
        type: "DELAY",
        severity: "WARNING",
        startsAt: new Date().toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it("debe rechazar tipo de alerta inválido", () => {
      const result = createAlertSchema.safeParse({
        title: "Alerta test",
        description: "Descripción de prueba para validar el schema",
        type: "INVALID_TYPE",
        severity: "INFO",
        startsAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });

    it("debe rechazar título muy corto", () => {
      const result = createAlertSchema.safeParse({
        title: "Hey",
        description: "Descripción válida con más de 10 caracteres",
        type: "GENERAL",
        severity: "INFO",
        startsAt: new Date().toISOString(),
      });
      expect(result.success).toBe(false);
    });
  });
});
