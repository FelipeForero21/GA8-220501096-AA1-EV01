# Configuración de Servidores, Base de Datos y Ambientes
## Sistema Web Metro de Medellín

---

## 1. Ambientes del Proyecto

| Ambiente | Propósito | URL | Base de Datos |
|---|---|---|---|
| **Desarrollo** | Trabajo local del aprendiz | `http://localhost:3000` | PostgreSQL local |
| **Pruebas** | Ejecución de tests automatizados | N/A (Jest en memoria) | Mocks de Prisma |
| **Producción** | Versión pública desplegada | Ver `06-despliegue.md` | PostgreSQL en la nube |

---

## 2. Ambiente de Desarrollo

### 2.1 Requisitos del equipo

| Componente | Versión mínima | Verificar con |
|---|---|---|
| Node.js | 20.x LTS | `node --version` |
| npm | 10.x | `npm --version` |
| PostgreSQL | 15.x | `psql --version` |
| Git | 2.x | `git --version` |

### 2.2 Configuración de PostgreSQL (local)

```sql
-- Crear base de datos y usuario
CREATE USER metro_user WITH PASSWORD 'metro_pass_dev';
CREATE DATABASE metro_medellin OWNER metro_user;
GRANT ALL PRIVILEGES ON DATABASE metro_medellin TO metro_user;
```

**Cadena de conexión resultante:**
```
DATABASE_URL="postgresql://metro_user:metro_pass_dev@localhost:5432/metro_medellin?schema=public"
```

### 2.3 Variables de entorno — Desarrollo

Archivo: `metro-app/.env.local`

```env
# Base de datos
DATABASE_URL="postgresql://metro_user:metro_pass_dev@localhost:5432/metro_medellin?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-minimo-32-caracteres-aqui"
AUTH_SECRET="dev-secret-minimo-32-caracteres-aqui"

# Redis (Upstash — cuenta gratuita)
UPSTASH_REDIS_REST_URL="https://su-instancia.upstash.io"
UPSTASH_REDIS_REST_TOKEN="su-token-upstash"

# Web Push — generar con: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="clave-publica-vapid"
VAPID_PRIVATE_KEY="clave-privada-vapid"
VAPID_SUBJECT="mailto:dev@metro.local"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

> **Nota de seguridad:** El archivo `.env.local` está en `.gitignore` y nunca se sube al repositorio.

### 2.4 Pasos de instalación en desarrollo

```bash
# 1. Clonar repositorio
git clone <url-repositorio>
cd metro-app

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env.local
# Editar .env.local con los valores reales

# 4. Generar el cliente de Prisma
npx prisma generate

# 5. Crear tablas en la base de datos
npx prisma migrate dev --name init

# 6. Cargar estaciones y líneas del metro
npx prisma db seed

# 7. Iniciar el servidor de desarrollo
npm run dev
# → Disponible en http://localhost:3000
```

---

## 3. Configuración de la Base de Datos

### 3.1 Modelo Entidad-Relación (descripción)

```
User (1) ──── (N) Card
Card (1) ──── (N) Trip
Trip (N) ──── (1) Station [origen]
Trip (N) ──── (1) Station [destino]
Station (N) ── (1) Line
Station (1) ── (N) StationConnection [desde]
Station (1) ── (N) StationConnection [hacia]
Alert (N) ──── (1) Station [opcional]
Alert (N) ──── (1) Line [opcional]
User (1) ──── (N) Account [OAuth]
User (1) ──── (N) Session
```

### 3.2 Tablas creadas por Prisma

| Tabla | Registros iniciales (seed) | Descripción |
|---|---|---|
| `users` | 0 (se crean al registrarse) | Usuarios del sistema |
| `accounts` | 0 | Cuentas OAuth (NextAuth) |
| `sessions` | 0 | Sesiones activas |
| `lines` | 5 | Línea A, B, T-A, K, J |
| `stations` | 28 | Estaciones reales del metro |
| `station_connections` | 0 (agregar manualmente) | Conexiones del grafo |
| `cards` | 0 | Tarjetas de usuarios |
| `trips` | 0 | Historial de viajes |
| `alerts` | 0 | Alertas del sistema |
| `push_subscriptions` | 0 | Suscripciones Web Push |

### 3.3 Comandos de Prisma

```bash
# Ver estado de migraciones
npx prisma migrate status

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Abrir interfaz visual de la BD
npx prisma studio
# → Disponible en http://localhost:5555

# Resetear BD (¡elimina todos los datos!)
npx prisma migrate reset

# Regenerar cliente tras cambiar schema
npx prisma generate
```

### 3.4 Índices importantes en la base de datos

| Tabla | Campo(s) | Tipo |
|---|---|---|
| `users` | `email` | UNIQUE |
| `cards` | `cardNumber` | UNIQUE |
| `stations` | `code` | UNIQUE |
| `lines` | `code` | UNIQUE |
| `station_connections` | `(fromStationId, toStationId)` | UNIQUE |
| `push_subscriptions` | `endpoint` | UNIQUE |
| `sessions` | `sessionToken` | UNIQUE |

---

## 4. Configuración de Redis (Upstash)

### 4.1 Crear instancia gratuita

1. Ir a [https://upstash.com](https://upstash.com) y crear cuenta
2. Crear una base de datos Redis en la región más cercana (ej: `us-east-1`)
3. Copiar `REST URL` y `REST Token` al `.env.local`

### 4.2 Uso en el proyecto

| Función | Clave Redis | TTL |
|---|---|---|
| Rate limiting de API | `metro-app:{ip}` | Ventana deslizante 10s |
| Caché del grafo de rutas | `metro:graph` | 300 segundos (5 min) |

### 4.3 Configuración del rate limiter

```typescript
// lib/redis.ts
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  // 10 peticiones máximo en ventana de 10 segundos
});
```

---

## 5. Ambiente de Pruebas

### 5.1 Configuración de Jest

**Archivo:** `metro-app/jest.config.ts`

```typescript
{
  preset: "ts-jest",
  testEnvironment: "jsdom",       // Simula el DOM del navegador
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"    // Resuelve alias @/ del tsconfig
  }
}
```

### 5.2 Estrategia de mocking

Toda la capa de infraestructura (Prisma, Redis, bcrypt) se reemplaza con mocks en las pruebas para garantizar:
- Pruebas deterministas (mismo resultado siempre)
- Sin dependencia de servicios externos
- Ejecución rápida (< 5 segundos para todas las pruebas)

### 5.3 Ejecutar pruebas

```bash
# Todas las pruebas
npm run test

# Con reporte de cobertura HTML
npm run test:coverage
# → Reporte en metro-app/coverage/lcov-report/index.html

# Modo watch (durante desarrollo)
npm run test:watch

# Un archivo específico
npx jest __tests__/services/route.service.test.ts
```

---

## 6. Pipeline CI/CD (GitHub Actions)

**Archivo:** `.github/workflows/ci.yml`

```
Push / PR a main
       │
       ▼
┌─────────────────────┐
│  1. Checkout código  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Setup Node 20   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. npm ci          │  ← Instalación limpia
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. prisma generate │  ← Genera tipos TypeScript
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  5. npm run lint    │  ← ESLint
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  6. npm run test    │  ← Jest (con cobertura)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  7. npm run build   │  ← Build Next.js
└──────────┬──────────┘
           │
    ✅ Todo OK?
     │         │
    Sí         No
     │         │
     ▼         ▼
  Deploy   ❌ Falla
  Vercel   (notifica)
```

### Variables de entorno en GitHub Actions

Configurar en `Settings > Secrets and variables > Actions`:

| Secret | Valor |
|---|---|
| `DATABASE_URL` | URL de BD de producción |
| `NEXTAUTH_SECRET` | Secret de producción |
| `UPSTASH_REDIS_REST_URL` | URL Redis de producción |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis de producción |

---

## 7. Control de Versiones (Git)

### Repositorio
- **Plataforma:** GitHub
- **Rama principal:** `main`
- **URL:** _(completar con la URL real del repositorio)_

### Flujo de trabajo

```bash
# Clonar
git clone <url>

# Ver estado
git status

# Agregar cambios
git add metro-app/

# Crear commit
git commit -m "feat: implementar módulo de rutas con BFS"

# Subir al repositorio
git push origin main
```

### Historial de commits relevantes

| Commit | Descripción |
|---|---|
| `5e2312b` | first commit — estructura base del proyecto |
| `7fee058` | finish to evidence — módulos completos |
| `eba7c75` | finish to evidence — documentación y pruebas |
