/**
 * Cliente de Redis (Upstash)
 * Utilizado para caché y rate limiting
 */

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/** Instancia del cliente Redis de Upstash */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limiter para las API Routes
 * Permite 10 peticiones por ventana de 10 segundos
 */
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "metro-app",
});
