"use client";

/**
 * Componente de saldo de Tarjeta Cívica
 * Muestra la tarjeta visual con número, saldo y estado.
 * Carga los datos desde /api/tarjeta al montarse.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

/** Datos de una tarjeta del API */
interface CardData {
  id: string;
  cardNumber: string;
  balance: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  createdAt: string;
}

/** Etiquetas y colores por estado de tarjeta */
const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Activa", color: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactiva", color: "bg-gray-100 text-gray-800" },
  BLOCKED: { label: "Bloqueada", color: "bg-red-100 text-red-800" },
};

export function CardBalance() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar tarjetas del usuario al montar
  useEffect(() => {
    async function loadCards() {
      try {
        const res = await fetch("/api/tarjeta");
        const json = await res.json();
        if (json.success) {
          setCards(json.data);
        } else {
          setError(json.error);
        }
      } catch {
        setError("Error cargando tarjetas");
      } finally {
        setLoading(false);
      }
    }
    loadCards();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg border bg-card p-6">
        <div className="h-6 w-40 rounded bg-gray-200" />
        <div className="mt-4 h-10 w-32 rounded bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          No tienes tarjetas registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card) => {
        const status = statusConfig[card.status] || statusConfig.INACTIVE;
        return (
          <div
            key={card.id}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-metro-green to-metro-blue p-6 text-white shadow-lg"
          >
            {/* Decoración de fondo */}
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-8px] rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-0 h-24 w-24 translate-x-[-12px] translate-y-4 rounded-full bg-white/10" />

            {/* Contenido */}
            <div className="relative">
              <div className="flex items-start justify-between">
                <p className="text-sm opacity-80">Tarjeta Cívica</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Número de tarjeta */}
              <p className="mt-4 font-mono text-lg tracking-wider">
                {card.cardNumber.replace(/(.{4})/g, "$1 ").trim()}
              </p>

              {/* Saldo */}
              <div className="mt-4">
                <p className="text-sm opacity-80">Saldo disponible</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(Number(card.balance))}
                </p>
              </div>

              {/* Acciones */}
              <div className="mt-4 flex gap-2">
                <Link
                  href="/tarjeta/recarga"
                  className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/30"
                >
                  Recargar
                </Link>
                <Link
                  href="/tarjeta/historial"
                  className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20"
                >
                  Historial
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
