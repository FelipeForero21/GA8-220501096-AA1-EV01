"use client";

/**
 * Panel lateral de información de estación
 * Muestra detalles de la estación seleccionada en el mapa:
 * nombre, línea, tipo, coordenadas y acciones disponibles.
 */

import Link from "next/link";

/** Datos de estación recibidos del mapa */
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

interface StationPanelProps {
  station: MapStation | null;
  onClose: () => void;
}

/** Etiquetas legibles para los tipos de línea */
const lineTypeLabels: Record<string, string> = {
  METRO: "Metro",
  TRAM: "Tranvía",
  CABLE: "Metrocable",
  BUS: "Bus Alimentador",
};

export function StationPanel({ station, onClose }: StationPanelProps) {
  if (!station) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border bg-card p-6 lg:h-auto">
        <div className="text-center">
          <div className="mb-2 text-4xl">🚇</div>
          <p className="font-medium">Selecciona una estación</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Haz clic en cualquier estación del mapa para ver su información
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Encabezado con color de la línea */}
      <div
        className="rounded-t-lg p-4 text-white"
        style={{ backgroundColor: station.line.color }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{station.name}</h3>
            <p className="text-sm opacity-90">Código: {station.code}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Cuerpo con datos de la estación */}
      <div className="space-y-4 p-4">
        {/* Información de la línea */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground">Línea</h4>
          <div className="mt-1 flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: station.line.color }}
            />
            <span className="font-medium">{station.line.name}</span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {lineTypeLabels[station.line.type] || station.line.type}
            </span>
          </div>
        </div>

        {/* Estación de transbordo */}
        {station.isTransfer && (
          <div className="rounded-md bg-yellow-50 p-3">
            <p className="text-sm font-medium text-yellow-800">
              Estación de transbordo
            </p>
            <p className="text-xs text-yellow-700">
              Permite conexión con otras líneas del sistema
            </p>
          </div>
        )}

        {/* Posición en la línea */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground">
            Posición
          </h4>
          <p className="mt-1 text-sm">Estación #{station.order} de la línea</p>
        </div>

        {/* Coordenadas geográficas */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground">
            Ubicación
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {Number(station.latitude).toFixed(5)},{" "}
            {Number(station.longitude).toFixed(5)}
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-2 border-t pt-4">
          <Link
            href={`/rutas`}
            className="block w-full rounded-md bg-metro-blue px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-metro-blue/90"
          >
            Buscar ruta desde aquí
          </Link>
          <Link
            href="/alertas"
            className="block w-full rounded-md border px-4 py-2 text-center text-sm font-medium transition hover:bg-accent"
          >
            Ver alertas de esta estación
          </Link>
        </div>
      </div>
    </div>
  );
}
