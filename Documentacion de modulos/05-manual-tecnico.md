# Manual Técnico
## Sistema Web Metro de Medellín

---

| Campo | Detalle |
|---|---|
| **Sistema** | Aplicación Web Metro de Medellín |
| **Actividad** | GA8-220501096-AA1-EV01 |
| **Versión** | 1.0.0 |
| **Fecha** | Febrero 2026 |
| **Tecnología** | Next.js 14, TypeScript, PostgreSQL, Prisma, NextAuth |

---

## 1. Arquitectura del Sistema

### 1.1 Diagrama de capas

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Navegador)                  │
│   React Client Components + Server Components (RSC)      │
│   Estilos: Tailwind CSS + shadcn/ui                      │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / SSE / Web Push
┌─────────────────────▼───────────────────────────────────┐
│                  SERVIDOR (Next.js 14)                    │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │  App Router │  │  API Routes  │  │  Middleware    │   │
│  │  (páginas)  │  │  (REST/SSE)  │  │  (auth guard) │   │
│  └─────────────┘  └──────┬───────┘  └───────────────┘   │
│                           │                               │
│  ┌────────────────────────▼──────────────────────────┐   │
│  │                  CAPA DE SERVICIOS                 │   │
│  │  auth │ route │ card │ alert │ payment │ push      │   │
│  └────────────────────────┬──────────────────────────┘   │
│                           │                               │
│  ┌────────────────────────▼──────────────────────────┐   │
│  │              CAPA DE DATOS (Prisma ORM)            │   │
│  └────────────────────────┬──────────────────────────┘   │
└───────────────────────────┼─────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
  ┌─────────────┐   ┌──────────────┐   ┌────────────┐
  │ PostgreSQL  │   │  Redis       │   │  Upstash   │
  │ (datos)     │   │  (caché)     │   │  (push)    │
  └─────────────┘   └──────────────┘   └────────────┘
```

### 1.2 Decisiones de arquitectura

| Decisión | Justificación |
|---|---|
| **App Router sobre Pages Router** | Soporte nativo de Server Components, layouts anidados y mejoras de rendimiento |
| **Server Components por defecto** | Reducen el JavaScript enviado al cliente; los datos se obtienen en el servidor |
| **`"use client"` solo cuando es necesario** | Solo componentes con estado, efectos o eventos del navegador |
| **Patrón Repository en servicios** | Desacopla la lógica de negocio del ORM; facilita pruebas con mocks |
| **Zod para validación** | Validación en runtime con inferencia de tipos TypeScript automática |
| **Prisma `$transaction`** | Garantiza atomicidad en operaciones de dinero (recargas) |

---

## 2. Estructura de Archivos Detallada

### 2.1 Capa `app/` — Páginas y API Routes

| Archivo/Carpeta | Tipo | Descripción |
|---|---|---|
| `app/layout.tsx` | Server Component | Layout raíz: fuente global, metadatos, HTML |
| `app/page.tsx` | Server Component | Landing page con accesos rápidos a módulos |
| `app/globals.css` | CSS | Variables CSS para Tailwind (colores Metro) |
| `app/(auth)/layout.tsx` | Server Component | Layout centrado para login/registro |
| `app/(auth)/login/page.tsx` | Server Component | Renderiza `<LoginForm />` |
| `app/(auth)/register/page.tsx` | Server Component | Renderiza `<RegisterForm />` |
| `app/(dashboard)/layout.tsx` | Server Component | Layout con navbar para rutas protegidas |
| `app/(dashboard)/tarjeta/page.tsx` | Server Component | Página de saldo de tarjeta |
| `app/(dashboard)/tarjeta/historial/page.tsx` | Server Component | Historial de viajes |
| `app/(dashboard)/tarjeta/recarga/page.tsx` | Server Component | Formulario de recarga |
| `app/rutas/page.tsx` | Server Component | Buscador de rutas |
| `app/mapa/page.tsx` | Server Component | Mapa interactivo |
| `app/alertas/page.tsx` | Server Component | Alertas en tiempo real |
| `app/api/auth/[...nextauth]/route.ts` | API Route | Handlers de NextAuth (GET/POST) |
| `app/api/rutas/route.ts` | API Route | GET: búsqueda BFS |
| `app/api/estaciones/route.ts` | API Route | GET: lista de estaciones |
| `app/api/alertas/route.ts` | API Route | GET: alertas activas / POST: crear alerta |
| `app/api/alertas/sse/route.ts` | API Route | GET: stream SSE de alertas |
| `app/api/tarjeta/route.ts` | API Route | GET: tarjetas del usuario |
| `app/api/tarjeta/recarga/route.ts` | API Route | POST: procesar recarga |
| `app/api/tarjeta/historial/route.ts` | API Route | GET: viajes paginados |
| `app/api/push/subscribe/route.ts` | API Route | POST/DELETE: suscripción push |

### 2.2 Capa `lib/` — Utilidades e Infraestructura

| Archivo | Exporta | Descripción |
|---|---|---|
| `lib/prisma.ts` | `prisma` | Singleton del cliente Prisma (evita conexiones múltiples en dev) |
| `lib/auth.ts` | `auth`, `handlers`, `signIn`, `signOut` | Configuración completa de NextAuth v5 |
| `lib/redis.ts` | `redis`, `ratelimit` | Cliente Upstash Redis y configuración de rate limiting |
| `lib/utils.ts` | `cn`, `formatCurrency`, `formatDate` | Funciones utilitarias reutilizables |
| `lib/validators.ts` | Esquemas Zod | Validadores para cada endpoint del API |
| `lib/useSSE.ts` | `useSSE` | Hook custom para consumir endpoints SSE |

### 2.3 Capa `services/` — Lógica de Negocio

| Archivo | Patrón | Funciones principales |
|---|---|---|
| `services/auth.service.ts` | Repository | `registerUser`, `getUserByEmail` |
| `services/station.service.ts` | Repository | `getAllStations`, `getStationById`, `getStationsByLine` |
| `services/route.service.ts` | Service + BFS | `buildGraph`, `findRoute`, `getOperatingHours` |
| `services/card.service.ts` | Repository | `getCardsByUserId`, `rechargeCard`, `getTripHistory` |
| `services/alert.service.ts` | Repository | `getActiveAlerts`, `createAlert`, `deactivateAlert` |
| `services/payment.service.ts` | Service | `processPayment`, `getPaymentStatus` |
| `services/push.service.ts` | Service | `sendPushToAll`, `notifyAlert` |

---

## 3. Flujos Principales

### 3.1 Flujo de Búsqueda de Ruta (BFS)

```
Usuario selecciona origen y destino
              │
              ▼
GET /api/rutas?originId=A&destId=B
              │
              ▼
Validar parámetros con Zod ──── Error 400 si inválidos
              │
              ▼
Rate limiting por IP ──────── Error 429 si excede límite
              │
              ▼
route.service.buildGraph()
  └─ Consulta StationConnection en BD
  └─ Construye Map<stationId, GraphNode>
              │
              ▼
route.service.findRoute(A, B)
  └─ BFS desde A
  └─ Cola FIFO: [{id: A, path: [A]}]
  └─ Explorar vecinos nivel por nivel
  └─ Al encontrar B → retornar path
              │
              ▼
buildRouteResult(path)
  └─ Consulta datos de estaciones en BD
  └─ Calcula tiempo (suma aristas + 3 min por transbordo)
  └─ Detecta transbordos por cambio de lineId
  └─ Construye RouteResult
              │
              ▼
Respuesta 200 con ruta + horarios del día
```

### 3.2 Flujo de Recarga de Tarjeta

```
Usuario selecciona tarjeta y monto
              │
              ▼
POST /api/tarjeta/recarga { cardId, amount }
              │
              ▼
Verificar sesión JWT ──────── Error 401 si no autenticado
              │
              ▼
Rate limiting por userId ──── Error 429 si excede
              │
              ▼
Validar body con Zod ──────── Error 400 si inválido
              │
              ▼
payment.service.processPayment(cardId, amount)
  └─ Generar ID de transacción
  └─ Validar reglas de negocio del pago
  └─ Retornar { status: "completed" | "failed" }
              │
     ┌────────┴────────┐
  Exitoso           Fallido
     │                 │
     ▼                 ▼
card.service.rechargeCard()   Error 402
  └─ prisma.$transaction()
  └─ findFirst(cardId, userId) → verificar propiedad
  └─ Verificar status === "ACTIVE"
  └─ card.update({ balance: { increment: amount } })
              │
              ▼
Respuesta 200 con tarjeta actualizada + transactionId
```

### 3.3 Flujo de Alertas en Tiempo Real (SSE)

```
Cliente abre /alertas
              │
              ▼
PushToggle verifica soporte Web Push
              │
              ▼
AlertList → useSSE({ url: "/api/alertas/sse" })
              │
              ▼
GET /api/alertas/sse ──── Conexión HTTP persistente
              │
              ▼
Servidor envía: event: connected
              │
              ▼
Servidor consulta alertas activas
Envía: event: alerts  data: [...]
              │
              ▼
Cada 10 segundos:
  ├─ Consulta alertas activas
  ├─ Si hay cambios → envía event: alerts
  └─ Siempre → envía event: heartbeat
              │
              ▼
Cliente actualiza estado → React re-renderiza lista
              │
    Desconexión (cierre pestaña)
              │
              ▼
request.signal.abort → isConnected = false → cierra stream
```

---

## 4. Seguridad — Implementación Técnica

### 4.1 Autenticación JWT con NextAuth v5

```typescript
// lib/auth.ts
session: { strategy: "jwt", maxAge: 24 * 60 * 60 }

// Callbacks JWT: agrega id y role al token
jwt: async ({ token, user }) => {
  if (user) { token.id = user.id; token.role = user.role }
  return token
}
```

### 4.2 Protección de rutas con Middleware

```typescript
// middleware.ts
// Redirige a /login si intenta acceder a /tarjeta sin sesión
if (isDashboardPage && !isAuthenticated) {
  return NextResponse.redirect(new URL("/login", req.url))
}
```

**Rutas protegidas:** `/tarjeta`, `/tarjeta/historial`, `/tarjeta/recarga`

### 4.3 Cifrado de contraseñas

```typescript
// services/auth.service.ts
const SALT_ROUNDS = 12  // Configura el costo computacional
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
// El hash resultante es irreversible: "$2a$12$..."
```

### 4.4 Rate Limiting

```typescript
// lib/redis.ts — Ventana deslizante de 10 req/10s
export const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(10, "10 s")
})

// En cada API Route:
const { success } = await ratelimit.limit(`prefijo:${ip}`)
if (!success) return 429
```

### 4.5 Validación de entradas con Zod

Cada API Route valida su entrada **antes** de tocar la base de datos:

```typescript
const parsed = schema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
}
// Solo después se accede a la BD con datos validados
```

---

## 5. Modelos Prisma — Campos y Tipos

### User
| Campo | Tipo PostgreSQL | Notas |
|---|---|---|
| `id` | `TEXT` PK | CUID generado por Prisma |
| `email` | `TEXT` UNIQUE | Correo del usuario |
| `name` | `TEXT` | Nombre completo |
| `hashed_password` | `TEXT` | Hash bcrypt |
| `role` | `ENUM(USER, ADMIN)` | Rol del usuario |
| `created_at` | `TIMESTAMP` | Auto-generado |
| `updated_at` | `TIMESTAMP` | Auto-actualizado |

### Card
| Campo | Tipo PostgreSQL | Notas |
|---|---|---|
| `id` | `TEXT` PK | CUID |
| `card_number` | `TEXT` UNIQUE | 10 dígitos |
| `balance` | `DECIMAL(10,2)` | Saldo en COP |
| `status` | `ENUM(ACTIVE, INACTIVE, BLOCKED)` | Estado de la tarjeta |
| `user_id` | `TEXT` FK | Referencia a `users.id` |

### StationConnection (Grafo)
| Campo | Tipo PostgreSQL | Notas |
|---|---|---|
| `id` | `TEXT` PK | CUID |
| `from_station_id` | `TEXT` FK | Estación origen |
| `to_station_id` | `TEXT` FK | Estación destino |
| `travel_time` | `INTEGER` | Minutos de viaje |
| `distance` | `DECIMAL(10,2)` | Kilómetros |

Restricción UNIQUE en `(from_station_id, to_station_id)` evita conexiones duplicadas.

---

## 6. Variables de Entorno — Referencia Completa

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | ✅ Sí | URL de conexión PostgreSQL |
| `NEXTAUTH_URL` | ✅ Sí | URL base de la aplicación |
| `NEXTAUTH_SECRET` | ✅ Sí | Secret ≥ 32 chars para JWT |
| `AUTH_SECRET` | ✅ Sí | Igual que `NEXTAUTH_SECRET` |
| `UPSTASH_REDIS_REST_URL` | ✅ Sí | URL REST de Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ Sí | Token de autenticación Redis |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ⬜ Opcional | Para Web Push |
| `VAPID_PRIVATE_KEY` | ⬜ Opcional | Para Web Push |
| `VAPID_SUBJECT` | ⬜ Opcional | Email de contacto VAPID |
| `NODE_ENV` | ✅ Sí | `development` o `production` |

---

## 7. Dependencias Principales

### Producción
| Paquete | Versión | Uso |
|---|---|---|
| `next` | 14.2.5 | Framework principal |
| `react` / `react-dom` | 18.x | UI |
| `@prisma/client` | 5.x | ORM para PostgreSQL |
| `next-auth` | 5.x beta | Autenticación JWT |
| `@auth/prisma-adapter` | 2.x | Adaptador NextAuth-Prisma |
| `bcryptjs` | 2.x | Hash de contraseñas |
| `zod` | 3.x | Validación de esquemas |
| `@upstash/redis` | 1.x | Cliente Redis |
| `@upstash/ratelimit` | 2.x | Rate limiting |
| `react-zoom-pan-pinch` | 3.x | Zoom/paneo del mapa |
| `web-push` | 3.x | Envío de notificaciones Push |
| `tailwindcss-animate` | 1.x | Animaciones Tailwind |
| `clsx` + `tailwind-merge` | — | Combinación de clases CSS |

### Desarrollo
| Paquete | Versión | Uso |
|---|---|---|
| `prisma` | 5.x | CLI para migraciones y seed |
| `jest` | 29.x | Framework de pruebas |
| `ts-jest` | 29.x | Soporte TypeScript en Jest |
| `@testing-library/react` | 16.x | Pruebas de componentes |
| `typescript` | 5.x | Tipado estático |
| `eslint-config-next` | 14.x | Reglas de ESLint para Next.js |
