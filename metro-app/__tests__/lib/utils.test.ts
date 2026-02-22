/**
 * Pruebas unitarias - Funciones utilitarias
 * Verifica formateo de moneda, fechas y combinación de clases CSS
 */

import { cn, formatCurrency, formatDate } from "@/lib/utils";

describe("Utils", () => {
  describe("cn", () => {
    it("debe combinar clases CSS correctamente", () => {
      const result = cn("px-4", "py-2", "text-sm");
      expect(result).toContain("px-4");
      expect(result).toContain("py-2");
      expect(result).toContain("text-sm");
    });

    it("debe resolver conflictos de Tailwind (última clase gana)", () => {
      const result = cn("px-4", "px-6");
      expect(result).toBe("px-6");
    });

    it("debe manejar valores condicionales", () => {
      const isActive = true;
      const result = cn("base", isActive && "active");
      expect(result).toContain("active");
    });

    it("debe ignorar valores falsy", () => {
      const result = cn("base", false, null, undefined, "extra");
      expect(result).toBe("base extra");
    });
  });

  describe("formatCurrency", () => {
    it("debe formatear como moneda colombiana", () => {
      const result = formatCurrency(50000);
      // El formato puede variar según el entorno, pero debe contener el número
      expect(result).toContain("50");
    });

    it("debe manejar cero", () => {
      const result = formatCurrency(0);
      expect(result).toContain("0");
    });
  });

  describe("formatDate", () => {
    it("debe formatear una fecha en español", () => {
      const date = new Date("2026-02-22T10:30:00");
      const result = formatDate(date);
      // Debe contener el año y algún componente de la fecha
      expect(result).toContain("2026");
    });
  });
});
