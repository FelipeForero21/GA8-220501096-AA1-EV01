/**
 * Servicio de Tarjeta Cívica
 * Patrón Repository: gestiona saldos, consultas, recargas e historial.
 * Todas las operaciones de dinero usan transacciones Prisma.
 */

import { prisma } from "@/lib/prisma";
import type { Card, Trip } from "@prisma/client";

/**
 * Obtiene todas las tarjetas de un usuario
 * @param userId - ID del usuario propietario
 * @returns Lista de tarjetas del usuario
 */
export async function getCardsByUserId(userId: string): Promise<Card[]> {
  return prisma.card.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Obtiene una tarjeta por su ID, validando que pertenezca al usuario
 * @param cardId - ID de la tarjeta
 * @param userId - ID del usuario (para verificar propiedad)
 * @returns Tarjeta encontrada o null
 */
export async function getCardByIdForUser(
  cardId: string,
  userId: string
): Promise<Card | null> {
  return prisma.card.findFirst({
    where: { id: cardId, userId },
  });
}

/**
 * Obtiene una tarjeta por su número visible (10 dígitos)
 * @param cardNumber - Número de la tarjeta
 * @returns Tarjeta encontrada o null
 */
export async function getCardByNumber(
  cardNumber: string
): Promise<Card | null> {
  return prisma.card.findUnique({
    where: { cardNumber },
  });
}

/**
 * Recarga el saldo de una tarjeta dentro de una transacción.
 * Verifica que la tarjeta exista, esté activa y pertenezca al usuario.
 *
 * @param cardId - ID de la tarjeta a recargar
 * @param userId - ID del usuario propietario
 * @param amount - Monto de la recarga en COP
 * @returns Tarjeta actualizada con el nuevo saldo
 * @throws Error si la tarjeta no existe, no pertenece al usuario o está inactiva
 */
export async function rechargeCard(
  cardId: string,
  userId: string,
  amount: number
): Promise<Card> {
  return prisma.$transaction(async (tx) => {
    // Verificar propiedad y estado de la tarjeta
    const card = await tx.card.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new Error("Tarjeta no encontrada o no te pertenece");
    }
    if (card.status !== "ACTIVE") {
      throw new Error("La tarjeta no está activa. Contacta soporte.");
    }

    // Incrementar saldo atómicamente
    return tx.card.update({
      where: { id: cardId },
      data: {
        balance: { increment: amount },
      },
    });
  });
}

/**
 * Obtiene el historial de viajes de una tarjeta con datos de estaciones.
 * Incluye estación de origen y destino para cada viaje.
 *
 * @param cardId - ID de la tarjeta
 * @param limit - Máximo de viajes a retornar (default 20)
 * @param offset - Viajes a saltar para paginación (default 0)
 * @returns Lista de viajes con estaciones incluidas
 */
export async function getTripHistory(
  cardId: string,
  limit: number = 20,
  offset: number = 0
): Promise<(Trip & { originStation: { name: string }; destStation: { name: string } })[]> {
  return prisma.trip.findMany({
    where: { cardId },
    include: {
      originStation: { select: { name: true, code: true } },
      destStation: { select: { name: true, code: true } },
    },
    orderBy: { startTime: "desc" },
    take: limit,
    skip: offset,
  });
}

/**
 * Cuenta el total de viajes de una tarjeta (para paginación)
 * @param cardId - ID de la tarjeta
 * @returns Total de viajes registrados
 */
export async function getTripCount(cardId: string): Promise<number> {
  return prisma.trip.count({ where: { cardId } });
}
