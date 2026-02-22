/**
 * Esquemas de validación Zod
 * Centraliza todas las validaciones de entrada de la API
 */

import { z } from "zod";

// ---- Validaciones de Autenticación ----

/** Esquema para registro de nuevos usuarios */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  email: z
    .string()
    .email("El correo electrónico no es válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
});

/** Esquema para inicio de sesión */
export const loginSchema = z.object({
  email: z.string().email("El correo electrónico no es válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// ---- Validaciones de Rutas ----

/** Esquema para búsqueda de rutas entre estaciones */
export const searchRouteSchema = z.object({
  originId: z.string().cuid("ID de estación origen inválido"),
  destId: z.string().cuid("ID de estación destino inválido"),
});

// ---- Validaciones de Tarjeta Cívica ----

/** Esquema para consulta de saldo de tarjeta */
export const cardQuerySchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{10}$/, "El número de tarjeta debe tener 10 dígitos"),
});

/** Esquema para recarga de tarjeta */
export const rechargeSchema = z.object({
  cardId: z.string().cuid("ID de tarjeta inválido"),
  amount: z
    .number()
    .min(2000, "El monto mínimo de recarga es $2.000")
    .max(200000, "El monto máximo de recarga es $200.000"),
});

// ---- Validaciones de Alertas ----

/** Esquema para crear una nueva alerta (solo admin) */
export const createAlertSchema = z.object({
  title: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(200, "El título no puede exceder 200 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  type: z.enum(["DELAY", "CLOSURE", "MAINTENANCE", "GENERAL"]),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
  stationId: z.string().cuid().optional(),
  lineId: z.string().cuid().optional(),
  startsAt: z.string().datetime("Fecha de inicio inválida"),
  endsAt: z.string().datetime("Fecha de fin inválida").optional(),
});
