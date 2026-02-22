/**
 * Servicio de Estaciones
 * Patrón Repository: encapsula el acceso a datos de estaciones
 */

import { prisma } from "@/lib/prisma";
import type { Station, Line } from "@prisma/client";

/** Estación con datos de línea incluidos */
type StationWithLine = Station & { line: Line };

/**
 * Obtiene todas las estaciones ordenadas por línea y posición
 * @returns Lista de estaciones con información de la línea
 */
export async function getAllStations(): Promise<StationWithLine[]> {
  return prisma.station.findMany({
    include: { line: true },
    orderBy: [{ lineId: "asc" }, { order: "asc" }],
  });
}

/**
 * Obtiene una estación por su ID
 * @param id - Identificador único de la estación
 * @returns Estación encontrada o null
 */
export async function getStationById(
  id: string
): Promise<StationWithLine | null> {
  return prisma.station.findUnique({
    where: { id },
    include: { line: true },
  });
}

/**
 * Obtiene todas las estaciones de una línea específica
 * @param lineId - ID de la línea
 * @returns Estaciones de la línea ordenadas por posición
 */
export async function getStationsByLine(
  lineId: string
): Promise<StationWithLine[]> {
  return prisma.station.findMany({
    where: { lineId },
    include: { line: true },
    orderBy: { order: "asc" },
  });
}
