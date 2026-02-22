"use client";

/**
 * Componente de búsqueda de rutas
 * Client Component: formulario interactivo con selectores de estación
 * origen/destino. Llama al API /api/rutas y muestra resultados.
 */

import { useState, useEffect } from "react";
import { RouteResultCard } from "@/components/rutas/route-result";
import type { StationInfo, RouteResult } from "@/types";

/** Estación con datos de línea para los selectores */
interface StationOption {
  id: string;
  name: string;
  code: string;
  line: { name: string; color: string };
}

export function RouteSearch() {
  const [stations, setStations] = useState<StationOption[]>([]);
  const [originId, setOriginId] = useState("");
  const [destId, setDestId] = useState("");
  const [result, setResult] = useState<RouteResult | null>(null);
  const [schedule, setSchedule] = useState<{
    dayType: string;
    openTime: string;
    closeTime: string;
    frequency: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar estaciones al montar el componente
  useEffect(() => {
    async function loadStations() {
      try {
        const res = await fetch("/api/estaciones");
        const json = await res.json();
        if (json.success) {
          setStations(json.data);
        }
      } catch {
        console.error("Error cargando estaciones");
      }
    }
    loadStations();
  }, []);

  /**
   * Ejecuta la búsqueda de ruta llamando al API
   * Valida que origen y destino estén seleccionados
   */
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setSchedule(null);

    if (!originId || !destId) {
      setError("Selecciona ambas estaciones");
      return;
    }

    if (originId === destId) {
      setError("Las estaciones de origen y destino deben ser diferentes");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/rutas?originId=${originId}&destId=${destId}`
      );
      const json = await res.json();

      if (!json.success) {
        setError(json.error || "Error buscando ruta");
        return;
      }

      setResult({
        stations: json.data.stations,
        transfers: json.data.transfers,
        totalTime: json.data.totalTime,
        totalDistance: json.data.totalDistance,
      });
      setSchedule(json.data.schedule);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  /** Intercambia origen y destino */
  function handleSwap() {
    setOriginId(destId);
    setDestId(originId);
    setResult(null);
  }

  return (
    <div className="space-y-6">
      {/* Formulario de búsqueda */}
      <form
        onSubmit={handleSearch}
        className="rounded-lg border bg-card p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto]">
          {/* Selector de origen */}
          <div className="space-y-2">
            <label htmlFor="origin" className="text-sm font-medium">
              Estación de Origen
            </label>
            <select
              id="origin"
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-metro-blue"
            >
              <option value="">Seleccionar origen...</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.line.name})
                </option>
              ))}
            </select>
          </div>

          {/* Botón intercambiar */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSwap}
              className="mb-0.5 rounded-md border p-2 text-muted-foreground transition hover:bg-accent"
              title="Intercambiar origen y destino"
            >
              ⇄
            </button>
          </div>

          {/* Selector de destino */}
          <div className="space-y-2">
            <label htmlFor="dest" className="text-sm font-medium">
              Estación de Destino
            </label>
            <select
              id="dest"
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-metro-blue"
            >
              <option value="">Seleccionar destino...</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.line.name})
                </option>
              ))}
            </select>
          </div>

          {/* Botón buscar */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-metro-blue px-6 py-2 text-sm font-medium text-white transition hover:bg-metro-blue/90 disabled:opacity-50 md:w-auto"
            >
              {loading ? "Buscando..." : "Buscar Ruta"}
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </form>

      {/* Resultado de la búsqueda */}
      {result && <RouteResultCard result={result} schedule={schedule} />}
    </div>
  );
}
