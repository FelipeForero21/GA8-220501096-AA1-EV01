/**
 * Servicio de Rutas - Metro de Medellín
 * Implementa BFS (Breadth-First Search) sobre el grafo de la red metro
 * para encontrar la ruta con menor número de paradas entre dos estaciones.
 *
 * El grafo es bidireccional: cada conexión permite ir y volver.
 */

import { prisma } from "@/lib/prisma";
import type { RouteResult, StationInfo, GraphNode } from "@/types";

/**
 * Construye el grafo de adyacencia de la red del metro.
 * Cada nodo es una estación con la lista de vecinos adyacentes.
 * Las conexiones son bidireccionales.
 *
 * @returns Mapa del grafo donde la clave es el stationId
 */
export async function buildGraph(): Promise<Map<string, GraphNode>> {
  const connections = await prisma.stationConnection.findMany({
    include: {
      fromStation: { include: { line: true } },
      toStation: { include: { line: true } },
    },
  });

  const graph = new Map<string, GraphNode>();

  for (const conn of connections) {
    // Inicializar nodo origen si no existe
    if (!graph.has(conn.fromStationId)) {
      graph.set(conn.fromStationId, {
        stationId: conn.fromStationId,
        neighbors: [],
      });
    }

    // Inicializar nodo destino si no existe
    if (!graph.has(conn.toStationId)) {
      graph.set(conn.toStationId, {
        stationId: conn.toStationId,
        neighbors: [],
      });
    }

    // Arista bidireccional: ida
    graph.get(conn.fromStationId)!.neighbors.push({
      stationId: conn.toStationId,
      travelTime: conn.travelTime,
      distance: Number(conn.distance),
    });

    // Arista bidireccional: vuelta
    graph.get(conn.toStationId)!.neighbors.push({
      stationId: conn.fromStationId,
      travelTime: conn.travelTime,
      distance: Number(conn.distance),
    });
  }

  return graph;
}

/**
 * Busca la ruta más corta entre dos estaciones usando BFS.
 *
 * Algoritmo:
 * 1. Iniciar cola FIFO con la estación origen
 * 2. Explorar vecinos nivel por nivel
 * 3. Al encontrar el destino, reconstruir la ruta completa
 * 4. Calcular transbordos, tiempo total y distancia
 *
 * @param originId - ID de la estación de origen
 * @param destId - ID de la estación de destino
 * @returns RouteResult con la ruta o null si no existe conexión
 */
export async function findRoute(
  originId: string,
  destId: string
): Promise<RouteResult | null> {
  // Caso especial: origen y destino iguales
  if (originId === destId) {
    const station = await prisma.station.findUnique({
      where: { id: originId },
      include: { line: true },
    });
    if (!station) return null;

    return {
      stations: [
        {
          id: station.id,
          name: station.name,
          code: station.code,
          lineName: station.line.name,
          lineColor: station.line.color,
          isTransfer: station.isTransfer,
        },
      ],
      transfers: 0,
      totalTime: 0,
      totalDistance: 0,
    };
  }

  const graph = await buildGraph();

  // Verificar que ambas estaciones existan en el grafo
  if (!graph.has(originId) || !graph.has(destId)) {
    return null;
  }

  // Estructuras BFS
  const visited = new Set<string>();
  const queue: { stationId: string; path: string[] }[] = [];

  queue.push({ stationId: originId, path: [originId] });
  visited.add(originId);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // ¿Llegamos al destino?
    if (current.stationId === destId) {
      return await buildRouteResult(current.path, graph);
    }

    // Explorar vecinos no visitados
    const node = graph.get(current.stationId)!;
    for (const neighbor of node.neighbors) {
      if (!visited.has(neighbor.stationId)) {
        visited.add(neighbor.stationId);
        queue.push({
          stationId: neighbor.stationId,
          path: [...current.path, neighbor.stationId],
        });
      }
    }
  }

  // BFS terminó sin encontrar ruta
  return null;
}

/**
 * Reconstruye el resultado detallado a partir del camino BFS.
 * Calcula transbordos, tiempo total y distancia recorrida.
 *
 * @param path - Array ordenado de IDs de estaciones
 * @param graph - Grafo para obtener pesos de aristas
 * @returns RouteResult con información completa
 */
async function buildRouteResult(
  path: string[],
  graph: Map<string, GraphNode>
): Promise<RouteResult> {
  const stations = await prisma.station.findMany({
    where: { id: { in: path } },
    include: { line: true },
  });

  // Mapa para acceso O(1) por ID
  const stationMap = new Map(stations.map((s) => [s.id, s]));

  let totalTime = 0;
  let totalDistance = 0;
  let transfers = 0;
  const stationInfos: StationInfo[] = [];

  for (let i = 0; i < path.length; i++) {
    const station = stationMap.get(path[i])!;

    stationInfos.push({
      id: station.id,
      name: station.name,
      code: station.code,
      lineName: station.line.name,
      lineColor: station.line.color,
      isTransfer: station.isTransfer,
    });

    if (i > 0) {
      // Sumar peso de la arista entre estaciones consecutivas
      const prevNode = graph.get(path[i - 1])!;
      const edge = prevNode.neighbors.find((n) => n.stationId === path[i]);
      if (edge) {
        totalTime += edge.travelTime;
        totalDistance += edge.distance;
      }

      // Detectar transbordo: cambio de línea
      const prevStation = stationMap.get(path[i - 1])!;
      if (prevStation.lineId !== station.lineId) {
        transfers++;
        totalTime += 3; // +3 min por transbordo (caminata)
      }
    }
  }

  return {
    stations: stationInfos,
    transfers,
    totalTime,
    totalDistance: Math.round(totalDistance * 100) / 100,
  };
}

/**
 * Retorna los horarios de operación según el día actual.
 * @returns Horario con tipo de día, apertura, cierre y frecuencia
 */
export function getOperatingHours(): {
  dayType: string;
  openTime: string;
  closeTime: string;
  frequency: string;
} {
  const day = new Date().getDay();

  if (day === 0) {
    return {
      dayType: "Domingo/Festivo",
      openTime: "05:00",
      closeTime: "23:00",
      frequency: "Cada 8-12 minutos",
    };
  }
  if (day === 6) {
    return {
      dayType: "Sábado",
      openTime: "05:00",
      closeTime: "23:00",
      frequency: "Cada 6-10 minutos",
    };
  }

  return {
    dayType: "Lunes a Viernes",
    openTime: "04:30",
    closeTime: "23:00",
    frequency: "Cada 3-6 minutos",
  };
}
