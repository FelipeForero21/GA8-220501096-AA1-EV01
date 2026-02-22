/**
 * Tipos globales de la aplicación Metro de Medellín
 * Extiende los tipos de NextAuth y define interfaces propias
 */

import { type DefaultSession } from "next-auth";

// ---- Extensión de tipos de NextAuth ----

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// ---- Tipos del dominio ----

/** Resultado de la búsqueda de ruta con BFS */
export interface RouteResult {
  /** Estaciones que componen la ruta (en orden) */
  stations: StationInfo[];
  /** Número total de transbordos */
  transfers: number;
  /** Tiempo estimado total en minutos */
  totalTime: number;
  /** Distancia total en kilómetros */
  totalDistance: number;
}

/** Información resumida de una estación */
export interface StationInfo {
  id: string;
  name: string;
  code: string;
  lineName: string;
  lineColor: string;
  isTransfer: boolean;
}

/** Datos de un nodo en el grafo para BFS */
export interface GraphNode {
  stationId: string;
  neighbors: {
    stationId: string;
    travelTime: number;
    distance: number;
  }[];
}

/** Respuesta estándar de la API */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Datos para la suscripción Web Push */
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/** Información de pago para recarga de tarjeta */
export interface PaymentInfo {
  cardId: string;
  amount: number;
  transactionId: string;
  status: "pending" | "completed" | "failed";
}
