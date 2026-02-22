# Metro de Medellín - Aplicación Web

Aplicación web del sistema de transporte masivo Metro de Medellín. Permite consultar rutas, explorar el mapa interactivo de la red, gestionar la Tarjeta Cívica y recibir alertas en tiempo real.

**Actividad de aprendizaje:** GA8-220501096-AA1-EV01

## Stack Tecnológico

- **Next.js 14** (App Router + TypeScript)
- **Tailwind CSS + shadcn/ui**
- **PostgreSQL**
- **Prisma ORM**
- **NextAuth.js v5** (JWT)
- **Jest + React Testing Library**

## Funcionalidades

### 1. Rutas y Horarios
- Búsqueda de la ruta más corta entre estaciones usando el algoritmo BFS (Breadth-First Search).
- Cálculo automático de transbordos.
- Visualización de tiempo estimado y distancia.

### 2. Mapa Interactivo
- Mapa SVG con zoom y paneo.
- Estaciones generadas dinámicamente desde la base de datos.
- Panel lateral con información detallada al seleccionar una estación.

### 3. Tarjeta Cívica (requiere autenticación)
- Consulta de saldo en tiempo real.
- Historial paginado de viajes.
- Recarga de saldo.
- Transacciones seguras usando Prisma `$transaction`.

### 4. Notificaciones
- Alertas en tiempo real mediante Server-Sent Events (SSE).
- Filtros por tipo y severidad.
- Reconexión automática del cliente.

## Estructura del Proyecto

```text
metro-app/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── rutas/
│   ├── mapa/
│   ├── alertas/
│   └── api/
├── components/
├── lib/
├── services/
├── prisma/
├── types/
├── middleware.ts
└── __tests__/
```

## Modelos Principales

- User
- Account
- Session
- Card
- Trip
- Alert
- Station
- Line
- StationConnection
- PushSubscription

## Instalación

### Prerrequisitos
- Node.js 20+
- PostgreSQL 15+

### Pasos

1. **Clonar repositorio**
   ```bash
   git clone <url-del-repo>
   cd metro-app
   ```
2. **Instalar dependencias**
   ```bash
   npm install
   ```
3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
4. **Generar cliente Prisma**
   ```bash
   npx prisma generate
   ```
5. **Ejecutar migraciones**
   ```bash
   npx prisma migrate dev
   ```
6. **Cargar datos iniciales**
   ```bash
   npx prisma db seed
   ```
7. **Iniciar servidor**
   ```bash
   npm run dev
   ```

La aplicación estará disponible en: [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` – Desarrollo
- `npm run build` – Build producción
- `npm run start` – Servidor producción
- `npm run lint` – Linting
- `npm run test` – Pruebas
- `npm run test:coverage` – Cobertura
- `npm run prisma:studio` – Interfaz de base de datos

## Seguridad

- Autenticación con JWT (NextAuth v5)
- Contraseñas cifradas con bcrypt
- Protección de rutas mediante middleware
- Validación de entradas con Zod
- Variables sensibles en `.env.local`

## Pruebas

Cobertura sobre:
- Servicios (auth, rutas, tarjeta, alertas, pagos, estaciones)
- Utilidades y validaciones
- Componentes críticos
- Endpoints principales

## Principios de Diseño

- TypeScript estricto
- Server Components por defecto
- Patrón Repository con Prisma
- Validación en las API Routes
- Aplicación de principios SOLID y Clean Code