"use client";

/**
 * Componente de resultado de ruta
 * Muestra la ruta encontrada por BFS con:
 * - Lista de estaciones en orden
 * - Transbordos señalizados
 * - Tiempo total y distancia
 * - Horarios de operación del día
 */

import type { RouteResult } from "@/types";

interface RouteResultCardProps {
  result: RouteResult;
  schedule: {
    dayType: string;
    openTime: string;
    closeTime: string;
    frequency: string;
  } | null;
}

export function RouteResultCard({ result, schedule }: RouteResultCardProps) {
  return (
    <div className="space-y-4">
      {/* Resumen de la ruta */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-metro-blue">
            {result.totalTime} min
          </p>
          <p className="text-sm text-muted-foreground">Tiempo estimado</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-metro-orange">
            {result.stations.length}
          </p>
          <p className="text-sm text-muted-foreground">Estaciones</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-metro-purple">
            {result.transfers}
          </p>
          <p className="text-sm text-muted-foreground">
            {result.transfers === 1 ? "Transbordo" : "Transbordos"}
          </p>
        </div>
      </div>

      {/* Recorrido estación por estación */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Recorrido</h3>
        <div className="relative">
          {result.stations.map((station, index) => {
            // Detectar si hay transbordo antes de esta estación
            const isTransferPoint =
              index > 0 &&
              result.stations[index - 1].lineName !== station.lineName;

            return (
              <div key={station.id + index} className="flex items-start gap-3">
                {/* Indicador visual de la línea */}
                <div className="flex flex-col items-center">
                  {/* Punto de la estación */}
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: station.lineColor,
                      backgroundColor:
                        index === 0 || index === result.stations.length - 1
                          ? station.lineColor
                          : "white",
                    }}
                  >
                    {(index === 0 ||
                      index === result.stations.length - 1) && (
                      <span className="text-xs font-bold text-white">
                        {index === 0 ? "A" : "B"}
                      </span>
                    )}
                  </div>
                  {/* Línea vertical entre estaciones */}
                  {index < result.stations.length - 1 && (
                    <div
                      className="h-8 w-0.5"
                      style={{ backgroundColor: station.lineColor }}
                    />
                  )}
                </div>

                {/* Información de la estación */}
                <div className="pb-6">
                  {/* Indicador de transbordo */}
                  {isTransferPoint && (
                    <div className="mb-1 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                      Transbordo → {station.lineName}
                    </div>
                  )}
                  <p className="font-medium">
                    {station.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({station.code})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {station.lineName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Distancia total */}
        <div className="mt-2 border-t pt-3 text-sm text-muted-foreground">
          Distancia total: {result.totalDistance} km
        </div>
      </div>

      {/* Horarios de operación */}
      {schedule && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold">Horarios de Operación</h3>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Día: </span>
              <span className="font-medium">{schedule.dayType}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Horario: </span>
              <span className="font-medium">
                {schedule.openTime} - {schedule.closeTime}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Frecuencia: </span>
              <span className="font-medium">{schedule.frequency}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
