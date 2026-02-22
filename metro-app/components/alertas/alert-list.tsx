"use client";

/**
 * Componente de lista de alertas en tiempo real
 * Se conecta al endpoint SSE para recibir alertas automáticamente.
 * También carga alertas iniciales desde el API REST como fallback.
 */

import { useState, useEffect } from "react";
import { useSSE } from "@/lib/useSSE";
import { AlertBadge } from "@/components/alertas/alert-badge";
import { formatDate } from "@/lib/utils";

/** Alerta del API con datos de estación y línea */
interface AlertData {
  id: string;
  title: string;
  description: string;
  type: "DELAY" | "CLOSURE" | "MAINTENANCE" | "GENERAL";
  severity: "INFO" | "WARNING" | "CRITICAL";
  active: boolean;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  station: { name: string; code: string } | null;
  line: { name: string; code: string; color: string } | null;
}

/** Etiquetas legibles para los tipos de alerta */
const alertTypeLabels: Record<string, string> = {
  DELAY: "Retraso",
  CLOSURE: "Cierre",
  MAINTENANCE: "Mantenimiento",
  GENERAL: "General",
};

/** Iconos por tipo de alerta */
const alertTypeIcons: Record<string, string> = {
  DELAY: "⏱️",
  CLOSURE: "🚫",
  MAINTENANCE: "🔧",
  GENERAL: "📢",
};

export function AlertList() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Conexión SSE para alertas en tiempo real
  const { data: sseAlerts, isConnected, error: sseError } = useSSE<AlertData[]>({
    url: "/api/alertas/sse",
    eventName: "alerts",
    autoReconnect: true,
  });

  // Cargar alertas iniciales desde REST API como fallback
  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await fetch("/api/alertas");
        const json = await res.json();
        if (json.success) {
          setAlerts(json.data);
        }
      } catch {
        console.error("Error cargando alertas");
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  // Actualizar alertas cuando llegan datos por SSE
  useEffect(() => {
    if (sseAlerts && Array.isArray(sseAlerts)) {
      setAlerts(sseAlerts);
      setLoading(false);
    }
  }, [sseAlerts]);

  // Filtrar alertas según el tipo seleccionado
  const filteredAlerts =
    filter === "ALL" ? alerts : alerts.filter((a) => a.type === filter);

  return (
    <div className="space-y-4">
      {/* Indicador de conexión SSE */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected
              ? "Conectado — Alertas en tiempo real"
              : sseError || "Desconectado"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {alerts.length} {alerts.length === 1 ? "alerta activa" : "alertas activas"}
        </span>
      </div>

      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "ALL", label: "Todas" },
          { value: "DELAY", label: "Retrasos" },
          { value: "CLOSURE", label: "Cierres" },
          { value: "MAINTENANCE", label: "Mantenimiento" },
          { value: "GENERAL", label: "General" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === f.value
                ? "bg-metro-red text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de alertas */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
              <div className="h-4 w-48 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-lg">✅</p>
          <p className="mt-2 font-medium">
            {filter === "ALL"
              ? "No hay alertas activas"
              : `No hay alertas de tipo "${alertTypeLabels[filter]}"`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            El sistema opera con normalidad
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border-l-4 bg-card p-4 shadow-sm ${
                alert.severity === "CRITICAL"
                  ? "border-l-red-500"
                  : alert.severity === "WARNING"
                    ? "border-l-yellow-500"
                    : "border-l-blue-500"
              }`}
            >
              {/* Encabezado de la alerta */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {alertTypeIcons[alert.type]}
                  </span>
                  <h3 className="font-semibold">{alert.title}</h3>
                </div>
                <AlertBadge severity={alert.severity} />
              </div>

              {/* Descripción */}
              <p className="mt-2 text-sm text-muted-foreground">
                {alert.description}
              </p>

              {/* Metadatos */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {/* Tipo */}
                <span className="rounded bg-gray-100 px-2 py-0.5">
                  {alertTypeLabels[alert.type]}
                </span>

                {/* Estación afectada */}
                {alert.station && (
                  <span>
                    Estación: <strong>{alert.station.name}</strong>
                  </span>
                )}

                {/* Línea afectada */}
                {alert.line && (
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: alert.line.color }}
                    />
                    {alert.line.name}
                  </span>
                )}

                {/* Fecha */}
                <span>
                  Desde: {formatDate(new Date(alert.startsAt))}
                </span>

                {alert.endsAt && (
                  <span>
                    Hasta: {formatDate(new Date(alert.endsAt))}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
