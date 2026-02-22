/**
 * Pruebas unitarias - Servicio de Estaciones
 * Verifica consultas de estaciones por línea y por ID
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    station: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import {
  getAllStations,
  getStationById,
  getStationsByLine,
} from "@/services/station.service";
import { prisma } from "@/lib/prisma";

describe("StationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllStations", () => {
    it("debe retornar todas las estaciones con datos de línea", async () => {
      const mockStations = [
        { id: "s1", name: "Niquía", line: { name: "Línea A" } },
        { id: "s2", name: "Bello", line: { name: "Línea A" } },
      ];
      (prisma.station.findMany as jest.Mock).mockResolvedValue(mockStations);

      const result = await getAllStations();

      expect(result).toHaveLength(2);
      expect(prisma.station.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { line: true },
        })
      );
    });

    it("debe ordenar por línea y posición", async () => {
      (prisma.station.findMany as jest.Mock).mockResolvedValue([]);

      await getAllStations();

      expect(prisma.station.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ lineId: "asc" }, { order: "asc" }],
        })
      );
    });
  });

  describe("getStationById", () => {
    it("debe retornar la estación con su línea", async () => {
      const mockStation = {
        id: "s1",
        name: "Niquía",
        line: { name: "Línea A", color: "#0072BC" },
      };
      (prisma.station.findUnique as jest.Mock).mockResolvedValue(mockStation);

      const result = await getStationById("s1");

      expect(result!.name).toBe("Niquía");
      expect(result!.line.color).toBe("#0072BC");
    });

    it("debe retornar null si no existe", async () => {
      (prisma.station.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getStationById("inexistente");
      expect(result).toBeNull();
    });
  });

  describe("getStationsByLine", () => {
    it("debe filtrar estaciones por ID de línea", async () => {
      (prisma.station.findMany as jest.Mock).mockResolvedValue([]);

      await getStationsByLine("line-a");

      expect(prisma.station.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { lineId: "line-a" },
        })
      );
    });
  });
});
