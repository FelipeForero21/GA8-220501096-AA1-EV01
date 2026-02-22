/**
 * Pruebas unitarias - Servicio de Rutas (BFS)
 * Verifica la construcción del grafo y búsqueda de rutas
 */

// Mock de Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    stationConnection: { findMany: jest.fn() },
    station: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import { buildGraph, findRoute, getOperatingHours } from "@/services/route.service";
import { prisma } from "@/lib/prisma";

describe("RouteService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("buildGraph", () => {
    it("debe construir un grafo bidireccional desde las conexiones", async () => {
      // Arrange: 3 estaciones conectadas linealmente A1 — A2 — A3
      (prisma.stationConnection.findMany as jest.Mock).mockResolvedValue([
        {
          fromStationId: "A1",
          toStationId: "A2",
          travelTime: 3,
          distance: 1.5,
          fromStation: { line: { name: "Línea A" } },
          toStation: { line: { name: "Línea A" } },
        },
        {
          fromStationId: "A2",
          toStationId: "A3",
          travelTime: 2,
          distance: 1.0,
          fromStation: { line: { name: "Línea A" } },
          toStation: { line: { name: "Línea A" } },
        },
      ]);

      // Act
      const graph = await buildGraph();

      // Assert
      expect(graph.size).toBe(3);
      expect(graph.get("A1")!.neighbors).toHaveLength(1);
      expect(graph.get("A2")!.neighbors).toHaveLength(2); // Bidireccional
      expect(graph.get("A3")!.neighbors).toHaveLength(1);
    });

    it("debe retornar un grafo vacío si no hay conexiones", async () => {
      (prisma.stationConnection.findMany as jest.Mock).mockResolvedValue([]);

      const graph = await buildGraph();
      expect(graph.size).toBe(0);
    });

    it("debe incluir tiempo de viaje y distancia en las aristas", async () => {
      (prisma.stationConnection.findMany as jest.Mock).mockResolvedValue([
        {
          fromStationId: "A1",
          toStationId: "A2",
          travelTime: 5,
          distance: 2.3,
          fromStation: { line: {} },
          toStation: { line: {} },
        },
      ]);

      const graph = await buildGraph();
      const neighbor = graph.get("A1")!.neighbors[0];

      expect(neighbor.travelTime).toBe(5);
      expect(neighbor.distance).toBe(2.3);
    });
  });

  describe("findRoute", () => {
    it("debe retornar null si las estaciones no existen en el grafo", async () => {
      (prisma.stationConnection.findMany as jest.Mock).mockResolvedValue([]);

      const result = await findRoute("inexistente1", "inexistente2");
      expect(result).toBeNull();
    });

    it("debe retornar ruta de una sola estación si origen = destino", async () => {
      (prisma.station.findUnique as jest.Mock).mockResolvedValue({
        id: "A1",
        name: "Niquía",
        code: "NQ",
        isTransfer: false,
        line: { name: "Línea A", color: "#0072BC" },
      });

      const result = await findRoute("A1", "A1");

      expect(result).not.toBeNull();
      expect(result!.stations).toHaveLength(1);
      expect(result!.transfers).toBe(0);
      expect(result!.totalTime).toBe(0);
    });

    it("debe encontrar ruta directa entre estaciones adyacentes", async () => {
      // Simular grafo: A1 — A2
      (prisma.stationConnection.findMany as jest.Mock).mockResolvedValue([
        {
          fromStationId: "A1",
          toStationId: "A2",
          travelTime: 3,
          distance: 1.5,
          fromStation: { line: { name: "Línea A" } },
          toStation: { line: { name: "Línea A" } },
        },
      ]);

      // Simular datos de estaciones
      (prisma.station.findMany as jest.Mock).mockResolvedValue([
        {
          id: "A1",
          name: "Niquía",
          code: "NQ",
          lineId: "line-a",
          isTransfer: false,
          line: { name: "Línea A", color: "#0072BC" },
        },
        {
          id: "A2",
          name: "Bello",
          code: "BL",
          lineId: "line-a",
          isTransfer: false,
          line: { name: "Línea A", color: "#0072BC" },
        },
      ]);

      const result = await findRoute("A1", "A2");

      expect(result).not.toBeNull();
      expect(result!.stations).toHaveLength(2);
      expect(result!.stations[0].name).toBe("Niquía");
      expect(result!.stations[1].name).toBe("Bello");
      expect(result!.totalTime).toBe(3);
      expect(result!.transfers).toBe(0);
    });
  });

  describe("getOperatingHours", () => {
    it("debe retornar horarios válidos", () => {
      const hours = getOperatingHours();

      expect(hours).toHaveProperty("dayType");
      expect(hours).toHaveProperty("openTime");
      expect(hours).toHaveProperty("closeTime");
      expect(hours).toHaveProperty("frequency");
      expect(hours.closeTime).toBe("23:00");
    });
  });
});
