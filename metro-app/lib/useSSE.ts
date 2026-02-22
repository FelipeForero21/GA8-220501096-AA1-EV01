"use client";

/**
 * Hook personalizado para Server-Sent Events (SSE)
 * Se conecta a un endpoint SSE y gestiona reconexión automática.
 * Recibe alertas en tiempo real sin necesidad de polling manual.
 */

import { useState, useEffect, useRef, useCallback } from "react";

interface UseSSEOptions {
  /** URL del endpoint SSE */
  url: string;
  /** Evento a escuchar (default: "alerts") */
  eventName?: string;
  /** Habilitar reconexión automática */
  autoReconnect?: boolean;
  /** Delay de reconexión en ms (default: 3000) */
  reconnectDelay?: number;
}

interface UseSSEReturn<T> {
  /** Datos más recientes recibidos */
  data: T | null;
  /** Indica si la conexión SSE está activa */
  isConnected: boolean;
  /** Error de conexión si existe */
  error: string | null;
  /** Reconectar manualmente */
  reconnect: () => void;
}

/**
 * Hook para consumir un endpoint SSE.
 * Maneja conexión, reconexión automática y limpieza.
 *
 * @param options - Configuración del SSE
 * @returns Estado de la conexión y datos recibidos
 */
export function useSSE<T = unknown>(options: UseSSEOptions): UseSSEReturn<T> {
  const {
    url,
    eventName = "alerts",
    autoReconnect = true,
    reconnectDelay = 3000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /** Conectar al endpoint SSE */
  const connect = useCallback(() => {
    // Cerrar conexión existente
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // Conexión establecida
    eventSource.addEventListener("connected", () => {
      setIsConnected(true);
      setError(null);
    });

    // Recibir datos del evento principal
    eventSource.addEventListener(eventName, (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch {
        console.error("Error parseando datos SSE");
      }
    });

    // Heartbeat: mantiene isConnected actualizado
    eventSource.addEventListener("heartbeat", () => {
      setIsConnected(true);
    });

    // Error de conexión
    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();

      if (autoReconnect) {
        setError("Conexión perdida. Reconectando...");
        reconnectTimeoutRef.current = setTimeout(connect, reconnectDelay);
      } else {
        setError("Conexión perdida.");
      }
    };
  }, [url, eventName, autoReconnect, reconnectDelay]);

  // Conectar al montar y limpiar al desmontar
  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    data,
    isConnected,
    error,
    reconnect: connect,
  };
}
