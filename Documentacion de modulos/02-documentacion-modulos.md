# Documentación por Módulo y Componente
## Sistema Web Metro de Medellín — Datos de Entrada y Salida

---

## MÓDULO 1: Rutas y Horarios

### Descripción
Permite al usuario buscar la ruta más corta entre dos estaciones de la red del metro usando el algoritmo BFS sobre un grafo de adyacencia bidireccional.

---

### Componente: `RouteSearch` — Buscador de Rutas

**Archivo:** `components/rutas/route-search.tsx`
**Tipo:** Client Component

| Concepto | Detalle |
|---|---|
| **Entrada** | Selección de estación origen (ID) y estación destino (ID) desde listas desplegables cargadas del API |
| **Salida** | Componente `RouteResultCard` con la ruta calculada, o mensaje de error si no hay ruta |
| **Estado interno** | `originId`, `destId`, `result`, `loading`, `error` |
| **Llamadas API** | `GET /api/estaciones` al montar; `GET /api/rutas?originId=&destId=` al enviar formulario |

**Validaciones del cliente:**
- Origen y destino deben estar seleccionados
- Origen ≠ Destino

---

### Componente: `RouteResultCard` — Resultado de Ruta

**Archivo:** `components/rutas/route-result.tsx`
**Tipo:** Client Component

| Prop | Tipo | Descripción |
|---|---|---|
| `result` | `RouteResult` | Objeto con estaciones, transbordos, tiempo y distancia |
| `schedule` | `object \| null` | Horarios del día: tipo de día, apertura, cierre, frecuencia |

**Salida visual:**
- Tarjetas de resumen: tiempo total (min), número de estaciones, número de transbordos
- Timeline vertical de estaciones con color de línea y badges de transbordo
- Tabla de horarios de operación del día

---

### API: `GET /api/rutas`

| Campo | Detalle |
|---|---|
| **Método** | GET |
| **URL** | `/api/rutas?originId={cuid}&destId={cuid}` |
| **Autenticación** | No requerida |
| **Rate limit** | 10 req / 10 seg por IP |

**Parámetros de entrada:**

| Parámetro | Tipo | Requerido | Validación |
|---|---|---|---|
| `originId` | string (CUID) | Sí | Formato CUID válido |
| `destId` | string (CUID) | Sí | Formato CUID válido |

**Respuesta exitosa `200`:**
```json
{
  "success": true,
  "data": {
    "stations": [
      {
        "id": "clx...",
        "name": "Niquía",
        "code": "NQ",
        "lineName": "Línea A",
        "lineColor": "#0072BC",
        "isTransfer": false
      }
    ],
    "transfers": 1,
    "totalTime": 28,
    "totalDistance": 14.5,
    "schedule": {
      "dayType": "Lunes a Viernes",
      "openTime": "04:30",
      "closeTime": "23:00",
      "frequency": "Cada 3-6 minutos"
    }
  }
}
```

**Respuestas de error:**

| Código | Causa |
|---|---|
| `400` | `originId` o `destId` tienen formato inválido |
| `404` | No existe ruta entre las estaciones |
| `429` | Rate limit superado |
| `500` | Error interno del servidor |

---

### API: `GET /api/estaciones`

| Campo | Detalle |
|---|---|
| **Método** | GET |
| **URL** | `/api/estaciones?lineId={cuid}` (lineId es opcional) |

**Respuesta `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "Niquía",
      "code": "NQ",
      "order": 1,
      "latitude": "6.3378000",
      "longitude": "-75.5440000",
      "isTransfer": false,
      "line": { "name": "Línea A", "code": "A", "color": "#0072BC", "type": "METRO" }
    }
  ]
}
```

---

### Servicio: `route.service.ts`

| Función | Entrada | Salida | Descripción |
|---|---|---|---|
| `buildGraph()` | — | `Map<string, GraphNode>` | Construye el grafo bidireccional desde `StationConnection` en BD |
| `findRoute(originId, destId)` | Dos IDs string | `RouteResult \| null` | BFS; retorna null si no hay ruta |
| `getOperatingHours()` | — | Objeto con horarios | Retorna horarios según día de la semana |

---

## MÓDULO 2: Mapa Interactivo

### Descripción
Mapa SVG de la red del metro generado dinámicamente desde la base de datos. Soporta zoom/paneo y muestra información detallada al seleccionar una estación.

---

### Componente: `MetroMap` — Mapa Principal

**Archivo:** `components/mapa/metro-map.tsx`
**Tipo:** Client Component

| Concepto | Detalle |
|---|---|
| **Entrada** | Ninguna (carga estaciones automáticamente desde `/api/estaciones`) |
| **Salida** | SVG interactivo con líneas, estaciones, leyenda y controles de zoom |
| **Interacción** | Clic en estación → actualiza `selectedStation` → muestra `StationPanel` |

**Función de conversión de coordenadas:**
- **Entrada:** `lat: number, lng: number`
- **Salida:** `{ x: number, y: number }` en píxeles del SVG
- Normaliza coordenadas geográficas reales al área del canvas SVG (800×900 px)

---

### Componente: `StationPanel` — Panel de Información

**Archivo:** `components/mapa/station-panel.tsx`
**Tipo:** Client Component

| Prop | Tipo | Descripción |
|---|---|---|
| `station` | `MapStation \| null` | Estación seleccionada; si es `null` muestra pantalla de bienvenida |
| `onClose` | `() => void` | Callback para cerrar el panel |

**Salida visual:**
- Encabezado con color de la línea, nombre y código de estación
- Tipo de línea (Metro, Tranvía, Cable, Bus)
- Badge si es estación de transbordo
- Posición en la línea y coordenadas
- Botones: "Buscar ruta desde aquí" y "Ver alertas"

---

## MÓDULO 3: Tarjeta Cívica

### Descripción
Módulo protegido por autenticación. Permite consultar el saldo, ver el historial de viajes y recargar la Tarjeta Cívica mediante pasarela de pago.

---

### Componente: `CardBalance` — Saldo de Tarjeta

**Archivo:** `components/tarjeta/card-balance.tsx`
**Tipo:** Client Component

| Concepto | Detalle |
|---|---|
| **Entrada** | Ninguna (carga desde `/api/tarjeta` usando la sesión activa) |
| **Salida** | Tarjeta visual con número, saldo formateado en COP, estado (Activa/Bloqueada) y accesos rápidos |

---

### Componente: `RechargeForm` — Formulario de Recarga

**Archivo:** `components/tarjeta/recharge-form.tsx`
**Tipo:** Client Component

| Entrada del usuario | Tipo | Validación |
|---|---|---|
| Selección de tarjeta | select | Solo muestra tarjetas activas |
| Monto predefinido | button | $5.000 / $10.000 / $20.000 / $50.000 / $100.000 |
| Monto personalizado | number | Mínimo $2.000, máximo $200.000 |

**Salida:**
- Mensaje de éxito con nuevo saldo e ID de transacción
- Mensaje de error si el pago falla o la tarjeta está inactiva

---

### Componente: `TripHistory` — Historial de Viajes

**Archivo:** `components/tarjeta/trip-history.tsx`
**Tipo:** Client Component

| Entrada | Detalle |
|---|---|
| Selección de tarjeta | Selector para usuarios con múltiples tarjetas |
| Paginación | Botones Anterior/Siguiente; 10 viajes por página |

**Salida (tabla):**

| Columna | Dato |
|---|---|
| Fecha | Fecha y hora del viaje formateada en español |
| Origen | Nombre y código de la estación de inicio |
| Destino | Nombre y código de la estación de llegada |
| Tarifa | Valor cobrado en COP |

---

### API: `GET /api/tarjeta`

| Campo | Detalle |
|---|---|
| **Método** | GET |
| **Autenticación** | Requerida (sesión JWT activa) |

**Respuesta `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "cardNumber": "1234567890",
      "balance": "45500.00",
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### API: `POST /api/tarjeta/recarga`

**Body de entrada:**
```json
{
  "cardId": "clx...",
  "amount": 20000
}
```

**Validaciones (Zod):**
- `cardId`: CUID válido
- `amount`: número entre 2.000 y 200.000

**Respuesta `200`:**
```json
{
  "success": true,
  "data": {
    "card": { "id": "clx...", "balance": "65500.00" },
    "transactionId": "TXN-1708617600000-AB3F9C",
    "message": "Recarga exitosa. Nuevo saldo: $65.500"
  }
}
```

**Respuestas de error:**

| Código | Causa |
|---|---|
| `400` | Monto fuera de rango o cardId inválido |
| `401` | Usuario no autenticado |
| `402` | Pago rechazado por la pasarela |
| `500` | Error interno (tarjeta bloqueada, no encontrada) |

---

### API: `GET /api/tarjeta/historial`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `cardId` | string (CUID) | ID de la tarjeta |
| `page` | number | Página (default: 1) |

**Respuesta `200`:**
```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": "clx...",
        "fare": "3100.00",
        "startTime": "2026-02-20T08:15:00.000Z",
        "originStation": { "name": "Niquía", "code": "NQ" },
        "destStation": { "name": "San Antonio", "code": "SA" }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 47,
      "totalPages": 5
    }
  }
}
```

---

### Servicio: `card.service.ts`

| Función | Entrada | Salida | Descripción |
|---|---|---|---|
| `getCardsByUserId(userId)` | string | `Card[]` | Tarjetas del usuario |
| `getCardByIdForUser(cardId, userId)` | 2 strings | `Card \| null` | Verifica propiedad |
| `rechargeCard(cardId, userId, amount)` | 2 strings + number | `Card` | Recarga atómica con `$transaction` |
| `getTripHistory(cardId, limit, offset)` | string + 2 numbers | `Trip[]` | Historial paginado |
| `getTripCount(cardId)` | string | number | Total de viajes |

---

## MÓDULO 4: Notificaciones

### Descripción
Sistema de alertas en tiempo real usando Server-Sent Events (SSE). Soporta Web Push para notificaciones del navegador incluso con la pestaña cerrada.

---

### Componente: `AlertList` — Lista de Alertas

**Archivo:** `components/alertas/alert-list.tsx`
**Tipo:** Client Component

| Concepto | Detalle |
|---|---|
| **Entrada** | Conexión SSE a `/api/alertas/sse` + carga inicial de `/api/alertas` |
| **Salida** | Lista de alertas con: tipo, severidad, descripción, estación/línea afectada, fechas |
| **Filtros** | Botones de filtro: Todas / Retrasos / Cierres / Mantenimiento / General |
| **Indicador** | Punto verde/rojo con estado de la conexión SSE |

---

### Componente: `AlertBadge` — Badge de Severidad

**Archivo:** `components/alertas/alert-badge.tsx`
**Tipo:** Server Component

| Prop | Tipo | Salida |
|---|---|---|
| `severity="INFO"` | string | Badge azul "Información" |
| `severity="WARNING"` | string | Badge amarillo "Advertencia" |
| `severity="CRITICAL"` | string | Badge rojo "Crítica" |

---

### Componente: `PushToggle` — Notificaciones Push

**Archivo:** `components/alertas/push-toggle.tsx`
**Tipo:** Client Component

| Acción | Proceso |
|---|---|
| Activar | Solicita permiso → registra SW → crea suscripción push → envía a `/api/push/subscribe` |
| Desactivar | Cancela suscripción en navegador → elimina de BD via `DELETE /api/push/subscribe` |

---

### API: `GET /api/alertas/sse`

| Campo | Detalle |
|---|---|
| **Método** | GET |
| **Content-Type** | `text/event-stream` |
| **Autenticación** | No requerida |

**Eventos que emite el servidor:**

| Evento | Frecuencia | Datos |
|---|---|---|
| `connected` | Al conectar | `{ connected: true, timestamp }` |
| `alerts` | Al conectar + cuando hay cambios | Array completo de alertas activas |
| `heartbeat` | Cada 10 segundos | `{ timestamp }` |

---

### API: `GET /api/alertas`

**Respuesta `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "title": "Retraso en Línea A",
      "description": "Retraso de 10 minutos por falla técnica en el sector norte",
      "type": "DELAY",
      "severity": "WARNING",
      "active": true,
      "startsAt": "2026-02-22T07:30:00.000Z",
      "endsAt": null,
      "station": null,
      "line": { "name": "Línea A", "code": "A", "color": "#0072BC" }
    }
  ]
}
```

---

### API: `POST /api/alertas`

**Requiere:** Rol `ADMIN`

**Body de entrada:**
```json
{
  "title": "Cierre estación Poblado",
  "description": "Cierre temporal por mantenimiento de torniquetes",
  "type": "CLOSURE",
  "severity": "WARNING",
  "stationId": "clx...",
  "startsAt": "2026-02-22T08:00:00.000Z",
  "endsAt": "2026-02-22T12:00:00.000Z"
}
```

**Tipos válidos:** `DELAY` | `CLOSURE` | `MAINTENANCE` | `GENERAL`
**Severidades válidas:** `INFO` | `WARNING` | `CRITICAL`

---

### Hook: `useSSE`

**Archivo:** `lib/useSSE.ts`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `url` | string | URL del endpoint SSE |
| `eventName` | string | Nombre del evento a escuchar (default: `"alerts"`) |
| `autoReconnect` | boolean | Reconectar automáticamente si se pierde la conexión |
| `reconnectDelay` | number | Milisegundos antes de reconectar (default: 3000) |

**Retorna:**

| Campo | Tipo | Descripción |
|---|---|---|
| `data` | `T \| null` | Último dato recibido por SSE |
| `isConnected` | boolean | Estado de la conexión |
| `error` | `string \| null` | Mensaje de error si existe |
| `reconnect` | `() => void` | Función para forzar reconexión |

---

## MÓDULO AUTH: Autenticación

### API: `POST /api/auth/register`

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@correo.com",
  "password": "Password123"
}
```

**Validaciones:**
- `name`: mínimo 2 caracteres, máximo 100
- `email`: formato válido, único en BD
- `password`: mínimo 8 chars, debe tener mayúscula, minúscula y número

**Respuesta `201`:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "Juan Pérez",
    "email": "juan@correo.com",
    "role": "USER"
  }
}
```

### API: `POST /api/auth/signin` (NextAuth)

**Body:**
```json
{
  "email": "juan@correo.com",
  "password": "Password123"
}
```

**Respuesta:** Cookie de sesión JWT con expiración de 24 horas.
