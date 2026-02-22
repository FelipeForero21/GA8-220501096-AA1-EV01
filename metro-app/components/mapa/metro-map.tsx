"use client";

/**
 * Componente del mapa SVG interactivo de la red del Metro de Medellín
 * Client Component: mapa con zoom/paneo usando react-zoom-pan-pinch.
 * Renderiza líneas, estaciones y permite seleccionar una estación.
 */

import { useState, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { StationPanel } from "@/components/mapa/station-panel";

/** Datos de una estación para el mapa */
interface MapStation {
  id: string;
  name: string;
  code: string;
  order: number;
  isTransfer: boolean;
  latitude: number;
  longitude: number;
  line: {
    id: string;
    name: string;
    code: string;
    color: string;
    type: string;
  };
}

/** Coordenadas del mapa SVG para transformar lat/lng a píxeles */
const MAP_CONFIG = {
  // Límites geográficos del área metropolitana
  minLat: 6.13,
  maxLat: 6.35,
  minLng: -75.63,
  maxLng: -75.53,
  // Dimensiones del SVG
  width: 800,
  height: 900,
  padding: 60,
};

/**
 * Convierte coordenadas geográficas a posición en el SVG
 * @param lat - Latitud de la estación
 * @param lng - Longitud de la estación
 * @returns Objeto con coordenadas x, y en el SVG
 */
function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const x =
    MAP_CONFIG.padding +
    ((lng - MAP_CONFIG.minLng) / (MAP_CONFIG.maxLng - MAP_CONFIG.minLng)) *
      (MAP_CONFIG.width - 2 * MAP_CONFIG.padding);
  // Invertir Y porque SVG crece hacia abajo pero latitud crece hacia arriba
  const y =
    MAP_CONFIG.padding +
    ((MAP_CONFIG.maxLat - lat) / (MAP_CONFIG.maxLat - MAP_CONFIG.minLat)) *
      (MAP_CONFIG.height - 2 * MAP_CONFIG.padding);
  return { x, y };
}

export function MetroMap() {
  const [stations, setStations] = useState<MapStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<MapStation | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Cargar estaciones desde la API
  useEffect(() => {
    async function loadStations() {
      try {
        const res = await fetch("/api/estaciones");
        const json = await res.json();
        if (json.success) {
          setStations(json.data);
        }
      } catch {
        console.error("Error cargando estaciones para el mapa");
      } finally {
        setLoading(false);
      }
    }
    loadStations();
  }, []);

  // Agrupar estaciones por línea para dibujar las conexiones
  const lineGroups = stations.reduce<Record<string, MapStation[]>>(
    (acc, station) => {
      const lineCode = station.line.code;
      if (!acc[lineCode]) acc[lineCode] = [];
      acc[lineCode].push(station);
      return acc;
    },
    {}
  );

  // Ordenar estaciones dentro de cada línea
  Object.values(lineGroups).forEach((group) =>
    group.sort((a, b) => a.order - b.order)
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border bg-card">
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      {/* Mapa SVG con zoom y paneo */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          centerOnInit
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Controles de zoom */}
              <div className="flex gap-2 border-b bg-gray-50 p-2">
                <button
                  onClick={() => zoomIn()}
                  className="rounded border bg-white px-3 py-1 text-sm hover:bg-gray-50"
                >
                  + Zoom
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="rounded border bg-white px-3 py-1 text-sm hover:bg-gray-50"
                >
                  - Zoom
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="rounded border bg-white px-3 py-1 text-sm hover:bg-gray-50"
                >
                  Restablecer
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: "100%", height: "600px" }}
                contentStyle={{ width: "100%", height: "100%" }}
              >
                <svg
                  viewBox={`0 0 ${MAP_CONFIG.width} ${MAP_CONFIG.height}`}
                  className="h-full w-full"
                >
                  {/* Fondo */}
                  <rect
                    width={MAP_CONFIG.width}
                    height={MAP_CONFIG.height}
                    fill="#f8fafc"
                  />

                  {/* Título del mapa */}
                  <text
                    x={MAP_CONFIG.width / 2}
                    y={30}
                    textAnchor="middle"
                    className="fill-gray-400 text-xs"
                  >
                    Red Metro de Medellín
                  </text>

                  {/* Dibujar líneas (conexiones entre estaciones) */}
                  {Object.entries(lineGroups).map(([lineCode, group]) => (
                    <g key={lineCode}>
                      {group.map((station, i) => {
                        if (i === 0) return null;
                        const prev = geoToSvg(
                          Number(group[i - 1].latitude),
                          Number(group[i - 1].longitude)
                        );
                        const curr = geoToSvg(
                          Number(station.latitude),
                          Number(station.longitude)
                        );
                        return (
                          <line
                            key={`line-${station.id}`}
                            x1={prev.x}
                            y1={prev.y}
                            x2={curr.x}
                            y2={curr.y}
                            stroke={station.line.color}
                            strokeWidth={4}
                            strokeLinecap="round"
                          />
                        );
                      })}
                    </g>
                  ))}

                  {/* Dibujar estaciones (puntos interactivos) */}
                  {stations.map((station) => {
                    const pos = geoToSvg(
                      Number(station.latitude),
                      Number(station.longitude)
                    );
                    const isSelected = selectedStation?.id === station.id;
                    const radius = station.isTransfer ? 8 : 6;

                    return (
                      <g
                        key={station.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedStation(station)}
                      >
                        {/* Halo de selección */}
                        {isSelected && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={radius + 4}
                            fill="none"
                            stroke={station.line.color}
                            strokeWidth={2}
                            opacity={0.5}
                          >
                            <animate
                              attributeName="r"
                              from={radius + 4}
                              to={radius + 8}
                              dur="1s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              from="0.5"
                              to="0"
                              dur="1s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}

                        {/* Punto de la estación */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={radius}
                          fill={isSelected ? station.line.color : "white"}
                          stroke={station.line.color}
                          strokeWidth={2.5}
                        />

                        {/* Nombre de la estación (solo estaciones de transbordo o seleccionada) */}
                        {(station.isTransfer || isSelected) && (
                          <text
                            x={pos.x + radius + 4}
                            y={pos.y + 4}
                            className="fill-gray-700"
                            fontSize={10}
                            fontWeight={isSelected ? "bold" : "normal"}
                          >
                            {station.name}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Leyenda de líneas */}
                  <g transform={`translate(${MAP_CONFIG.width - 180}, ${MAP_CONFIG.height - 140})`}>
                    <rect
                      x={-10}
                      y={-10}
                      width={180}
                      height={130}
                      rx={6}
                      fill="white"
                      stroke="#e2e8f0"
                    />
                    <text y={8} fontSize={11} fontWeight="bold" className="fill-gray-700">
                      Líneas
                    </text>
                    {Object.entries(lineGroups).map(([, group], i) => {
                      const line = group[0].line;
                      return (
                        <g key={line.code} transform={`translate(0, ${22 + i * 20})`}>
                          <line
                            x1={0}
                            y1={0}
                            x2={20}
                            y2={0}
                            stroke={line.color}
                            strokeWidth={3}
                            strokeLinecap="round"
                          />
                          <text
                            x={28}
                            y={4}
                            fontSize={10}
                            className="fill-gray-600"
                          >
                            {line.name}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Panel de información de estación */}
      <StationPanel
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
      />
    </div>
  );
}
