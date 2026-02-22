/**
 * Pruebas unitarias - Servicio de Alertas
 * Verifica obtención, creación y desactivación de alertas
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    alert: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import {
  getActiveAlerts,
  createAlert,
  deactivateAlert,
} from "@/services/alert.service";
import { prisma } from "@/lib/prisma";

describe("AlertService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getActiveAlerts", () => {
    it("debe retornar solo alertas activas", async () => {
      const mockAlerts = [
        {
          id: "alert1",
          title: "Retraso Línea A",
          active: true,
          severity: "WARNING",
        },
      ];
      (prisma.alert.findMany as jest.Mock).mockResolvedValue(mockAlerts);

      const result = await getActiveAlerts();

      expect(result).toEqual(mockAlerts);
      expect(prisma.alert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ active: true }),
        })
      );
    });

    it("debe ordenar por severidad descendente", async () => {
      (prisma.alert.findMany as jest.Mock).mockResolvedValue([]);

      await getActiveAlerts();

      expect(prisma.alert.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        })
      );
    });
  });

  describe("createAlert", () => {
    it("debe crear una alerta con los datos proporcionados", async () => {
      const alertData = {
        title: "Cierre estación Poblado",
        description: "Cierre temporal por mantenimiento",
        type: "CLOSURE" as const,
        severity: "WARNING" as const,
        startsAt: new Date(),
      };

      const mockCreated = { id: "new-alert", ...alertData, active: true };
      (prisma.alert.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await createAlert(alertData);

      expect(result.id).toBe("new-alert");
      expect(result.title).toBe("Cierre estación Poblado");
      expect(prisma.alert.create).toHaveBeenCalledWith({ data: alertData });
    });
  });

  describe("deactivateAlert", () => {
    it("debe marcar la alerta como inactiva", async () => {
      const mockDeactivated = { id: "alert1", active: false };
      (prisma.alert.update as jest.Mock).mockResolvedValue(mockDeactivated);

      const result = await deactivateAlert("alert1");

      expect(result.active).toBe(false);
      expect(prisma.alert.update).toHaveBeenCalledWith({
        where: { id: "alert1" },
        data: { active: false },
      });
    });
  });
});
