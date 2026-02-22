"use client";

/**
 * Formulario de recarga de Tarjeta Cívica
 * Permite seleccionar una tarjeta, un monto predefinido o personalizado,
 * y procesar el pago a través de la pasarela.
 */

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

/** Tarjeta del usuario */
interface CardData {
  id: string;
  cardNumber: string;
  balance: string;
  status: string;
}

/** Montos predefinidos de recarga en COP */
const PRESET_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

export function RechargeForm() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    transactionId?: string;
  } | null>(null);

  // Cargar tarjetas del usuario
  useEffect(() => {
    async function loadCards() {
      try {
        const res = await fetch("/api/tarjeta");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setCards(json.data.filter((c: CardData) => c.status === "ACTIVE"));
          setSelectedCardId(json.data[0].id);
        }
      } catch {
        console.error("Error cargando tarjetas");
      } finally {
        setLoadingCards(false);
      }
    }
    loadCards();
  }, []);

  /**
   * Procesa la recarga enviando al API
   */
  async function handleRecharge(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    // Determinar monto final
    const finalAmount = amount || parseInt(customAmount);
    if (!finalAmount || finalAmount < 2000) {
      setResult({
        success: false,
        message: "El monto mínimo de recarga es $2.000",
      });
      return;
    }
    if (finalAmount > 200000) {
      setResult({
        success: false,
        message: "El monto máximo de recarga es $200.000",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/tarjeta/recarga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: selectedCardId,
          amount: finalAmount,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setResult({
          success: true,
          message: json.data.message,
          transactionId: json.data.transactionId,
        });
        // Limpiar selección
        setAmount(0);
        setCustomAmount("");
      } else {
        setResult({
          success: false,
          message: json.error || "Error procesando la recarga",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Error de conexión. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loadingCards) {
    return (
      <div className="animate-pulse rounded-lg border bg-card p-6">
        <div className="h-6 w-48 rounded bg-gray-200" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          No tienes tarjetas activas para recargar.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleRecharge}
      className="space-y-6 rounded-lg border bg-card p-6 shadow-sm"
    >
      {/* Selector de tarjeta */}
      <div className="space-y-2">
        <label htmlFor="card" className="text-sm font-medium">
          Tarjeta a recargar
        </label>
        <select
          id="card"
          value={selectedCardId}
          onChange={(e) => setSelectedCardId(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-metro-purple"
        >
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.cardNumber.replace(/(.{4})/g, "$1 ").trim()} — Saldo:{" "}
              {formatCurrency(Number(card.balance))}
            </option>
          ))}
        </select>
      </div>

      {/* Montos predefinidos */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Selecciona un monto</label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset);
                setCustomAmount("");
              }}
              className={`rounded-md border px-3 py-3 text-sm font-medium transition ${
                amount === preset
                  ? "border-metro-purple bg-metro-purple text-white"
                  : "hover:border-metro-purple hover:text-metro-purple"
              }`}
            >
              {formatCurrency(preset)}
            </button>
          ))}
        </div>
      </div>

      {/* Monto personalizado */}
      <div className="space-y-2">
        <label htmlFor="customAmount" className="text-sm font-medium">
          O ingresa un monto personalizado
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
            $
          </span>
          <input
            id="customAmount"
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setAmount(0);
            }}
            min={2000}
            max={200000}
            step={1000}
            placeholder="Ej: 15000"
            className="w-full rounded-md border pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-metro-purple"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Mínimo $2.000 — Máximo $200.000
        </p>
      </div>

      {/* Resultado */}
      {result && (
        <div
          className={`rounded-md p-4 ${
            result.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-600"
          }`}
        >
          <p className="text-sm font-medium">{result.message}</p>
          {result.transactionId && (
            <p className="mt-1 text-xs">
              Transacción: {result.transactionId}
            </p>
          )}
        </div>
      )}

      {/* Botón de recarga */}
      <button
        type="submit"
        disabled={loading || (!amount && !customAmount)}
        className="w-full rounded-md bg-metro-purple py-3 text-sm font-medium text-white transition hover:bg-metro-purple/90 disabled:opacity-50"
      >
        {loading
          ? "Procesando pago..."
          : `Recargar ${amount || parseInt(customAmount) ? formatCurrency(amount || parseInt(customAmount)) : ""}`}
      </button>
    </form>
  );
}
