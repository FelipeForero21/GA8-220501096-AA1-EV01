/**
 * Pruebas unitarias - Servicio de Tarjeta Cívica
 * Verifica consulta de tarjetas, recargas e historial
 */

// Mock de Prisma con transacciones
const mockTransaction = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    card: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    trip: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: mockTransaction,
  },
}));

import {
  getCardsByUserId,
  getCardByIdForUser,
  rechargeCard,
  getTripHistory,
  getTripCount,
} from "@/services/card.service";
import { prisma } from "@/lib/prisma";

describe("CardService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCardsByUserId", () => {
    it("debe retornar las tarjetas del usuario", async () => {
      const mockCards = [
        { id: "card1", cardNumber: "1234567890", balance: 50000, userId: "user1" },
      ];
      (prisma.card.findMany as jest.Mock).mockResolvedValue(mockCards);

      const result = await getCardsByUserId("user1");

      expect(result).toEqual(mockCards);
      expect(prisma.card.findMany).toHaveBeenCalledWith({
        where: { userId: "user1" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("debe retornar array vacío si no tiene tarjetas", async () => {
      (prisma.card.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getCardsByUserId("user-sin-tarjetas");
      expect(result).toEqual([]);
    });
  });

  describe("getCardByIdForUser", () => {
    it("debe retornar la tarjeta si pertenece al usuario", async () => {
      const mockCard = { id: "card1", userId: "user1" };
      (prisma.card.findFirst as jest.Mock).mockResolvedValue(mockCard);

      const result = await getCardByIdForUser("card1", "user1");
      expect(result).toEqual(mockCard);
    });

    it("debe retornar null si la tarjeta no pertenece al usuario", async () => {
      (prisma.card.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getCardByIdForUser("card1", "otro-user");
      expect(result).toBeNull();
    });
  });

  describe("rechargeCard", () => {
    it("debe ejecutar la recarga dentro de una transacción", async () => {
      const mockUpdatedCard = {
        id: "card1",
        balance: 60000,
        status: "ACTIVE",
      };

      // Simular la transacción
      mockTransaction.mockImplementation(async (callback: Function) => {
        const tx = {
          card: {
            findFirst: jest.fn().mockResolvedValue({
              id: "card1",
              userId: "user1",
              status: "ACTIVE",
              balance: 50000,
            }),
            update: jest.fn().mockResolvedValue(mockUpdatedCard),
          },
        };
        return callback(tx);
      });

      const result = await rechargeCard("card1", "user1", 10000);

      expect(result.balance).toBe(60000);
      expect(mockTransaction).toHaveBeenCalled();
    });

    it("debe lanzar error si la tarjeta no existe", async () => {
      mockTransaction.mockImplementation(async (callback: Function) => {
        const tx = {
          card: { findFirst: jest.fn().mockResolvedValue(null) },
        };
        return callback(tx);
      });

      await expect(rechargeCard("fake", "user1", 10000)).rejects.toThrow(
        "Tarjeta no encontrada"
      );
    });

    it("debe lanzar error si la tarjeta está bloqueada", async () => {
      mockTransaction.mockImplementation(async (callback: Function) => {
        const tx = {
          card: {
            findFirst: jest.fn().mockResolvedValue({
              id: "card1",
              status: "BLOCKED",
            }),
          },
        };
        return callback(tx);
      });

      await expect(rechargeCard("card1", "user1", 10000)).rejects.toThrow(
        "La tarjeta no está activa"
      );
    });
  });

  describe("getTripHistory", () => {
    it("debe retornar viajes con estaciones incluidas", async () => {
      const mockTrips = [
        {
          id: "trip1",
          originStation: { name: "Niquía", code: "NQ" },
          destStation: { name: "Bello", code: "BL" },
        },
      ];
      (prisma.trip.findMany as jest.Mock).mockResolvedValue(mockTrips);

      const result = await getTripHistory("card1");

      expect(result).toEqual(mockTrips);
      expect(prisma.trip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { cardId: "card1" },
          take: 20,
          skip: 0,
        })
      );
    });
  });

  describe("getTripCount", () => {
    it("debe retornar el conteo de viajes", async () => {
      (prisma.trip.count as jest.Mock).mockResolvedValue(42);

      const result = await getTripCount("card1");
      expect(result).toBe(42);
    });
  });
});
