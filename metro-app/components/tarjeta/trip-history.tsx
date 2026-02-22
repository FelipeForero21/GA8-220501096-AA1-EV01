"use client";

/**
 * Componente de historial de viajes
 * Muestra una tabla paginada con todos los viajes realizados
 * usando una tarjeta cívica específica.
 */

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

/** Viaje con datos de estaciones */
interface TripData {
  id: string;
  fare: string;
  startTime: string;
  endTime: string | null;
  originStation: { name: string; code: string };
  destStation: { name: string; code: string };
}

/** Datos de paginación del API */
interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Tarjeta del usuario */
interface CardData {
  id: string;
  cardNumber: string;
}

export function TripHistory() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [trips, setTrips] = useState<TripData[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Cargar tarjetas
  useEffect(() => {
    async function loadCards() {
      try {
        const res = await fetch("/api/tarjeta");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCards(json.data);
          setSelectedCardId(json.data[0].id);
        }
      } catch {
        console.error("Error cargando tarjetas");
      }
    }
    loadCards();
  }, []);

  // Cargar historial cuando cambia la tarjeta o la página
  useEffect(() => {
    if (!selectedCardId) {
      setLoading(false);
      return;
    }

    async function loadTrips() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/tarjeta/historial?cardId=${selectedCardId}&page=${page}`
        );
        const json = await res.json();
        if (json.success) {
          setTrips(json.data.trips);
          setPagination(json.data.pagination);
        }
      } catch {
        console.error("Error cargando historial");
      } finally {
        setLoading(false);
      }
    }
    loadTrips();
  }, [selectedCardId, page]);

  return (
    <div className="space-y-4">
      {/* Selector de tarjeta */}
      {cards.length > 1 && (
        <div className="space-y-2">
          <label htmlFor="histCard" className="text-sm font-medium">
            Tarjeta
          </label>
          <select
            id="histCard"
            value={selectedCardId}
            onChange={(e) => {
              setSelectedCardId(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-metro-purple sm:w-auto"
          >
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.cardNumber.replace(/(.{4})/g, "$1 ").trim()}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabla de viajes */}
      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Fecha
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Origen
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Destino
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Tarifa
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Cargando historial...
                </td>
              </tr>
            ) : trips.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No hay viajes registrados
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr key={trip.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs">
                    {formatDate(new Date(trip.startTime))}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{trip.originStation.name}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({trip.originStation.code})
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{trip.destStation.name}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({trip.destStation.code})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(Number(trip.fare))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Mostrando {trips.length} de {pagination.total} viajes
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border px-3 py-1 transition hover:bg-accent disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="flex items-center px-2 text-muted-foreground">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-md border px-3 py-1 transition hover:bg-accent disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
