/**
 * Utilidades generales de la aplicación
 * Helpers compartidos entre componentes y servicios
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases CSS con soporte para Tailwind CSS
 * Usa clsx para condicionales y twMerge para resolver conflictos
 * @param inputs - Clases CSS a combinar
 * @returns Cadena de clases CSS combinadas sin conflictos
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un valor numérico como moneda colombiana (COP)
 * @param amount - Cantidad a formatear
 * @returns Cadena formateada como moneda (ej: "$2.500")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha en formato legible en español
 * @param date - Fecha a formatear
 * @returns Cadena con la fecha formateada (ej: "22 de febrero de 2026")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}
