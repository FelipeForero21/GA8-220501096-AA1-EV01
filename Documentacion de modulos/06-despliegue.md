# Guía de Despliegue
## Sistema Web Metro de Medellín

---

| Campo | Detalle |
|---|---|
| **Sistema** | Aplicación Web Metro de Medellín |
| **Plataforma** | Vercel (frontend + API) |
| **Base de datos** | PostgreSQL en Neon / Supabase |
| **Caché** | Upstash Redis |
| **Fecha** | Febrero 2026 |

---

## 1. URLs de Producción

| Módulo | URL | Estado |
|---|---|---|
| **Landing Page** | `https://metro-medellin.vercel.app/` | ✅ Desplegado |
| **Módulo Rutas** | `https://metro-medellin.vercel.app/rutas` | ✅ Desplegado |
| **Módulo Mapa** | `https://metro-medellin.vercel.app/mapa` | ✅ Desplegado |
| **Módulo Tarjeta** | `https://metro-medellin.vercel.app/tarjeta` | ✅ Desplegado (requiere login) |
| **Módulo Alertas** | `https://metro-medellin.vercel.app/alertas` | ✅ Desplegado |
| **Login** | `https://metro-medellin.vercel.app/login` | ✅ Desplegado |
| **Registro** | `https://metro-medellin.vercel.app/register` | ✅ Desplegado |

### APIs disponibles en producción

| Endpoint | Método | URL |
|---|---|---|
| Búsqueda de rutas | GET | `https://metro-medellin.vercel.app/api/rutas` |
| Listado estaciones | GET | `https://metro-medellin.vercel.app/api/estaciones` |
| Alertas activas | GET | `https://metro-medellin.vercel.app/api/alertas` |
| Stream SSE alertas | GET | `https://metro-medellin.vercel.app/api/alertas/sse` |
| Tarjetas usuario | GET | `https://metro-medellin.vercel.app/api/tarjeta` |
| Recarga tarjeta | POST | `https://metro-medellin.vercel.app/api/tarjeta/recarga` |
| Historial viajes | GET | `https://metro-medellin.vercel.app/api/tarjeta/historial` |

> **Nota:** Las URLs anteriores son de referencia. Reemplazar `metro-medellin` con el subdominio real asignado por Vercel.

---

## 2. Archivos Ejecutables y Artefactos

### 2.1 Build de producción

```bash
# Desde el directorio metro-app/
npm run build
```

Esto genera la carpeta `.next/` con los artefactos optimizados:

| Artefacto | Ruta | Descripción |
|---|---|---|
| Server bundle | `.next/server/` | Funciones del servidor (API Routes, RSC) |
| Client bundle | `.next/static/` | JavaScript y CSS optimizados para el cliente |
| HTML estático | `.next/static/chunks/` | Páginas pre-renderizadas |
| Manifest | `.next/build-manifest.json` | Mapa de todos los chunks generados |

### 2.2 Iniciar en modo producción (local)

```bash
# Construir
npm run build

# Iniciar servidor de producción
npm start
# → Disponible en http://localhost:3000
```

### 2.3 Exportar como archivo comprimido

```bash
# Comprimir el directorio del proyecto para entrega
cd ..
zip -r metro-medellin-GA8-220501096.zip metro-app/ \
  --exclude "metro-app/node_modules/*" \
  --exclude "metro-app/.next/*" \
  --exclude "metro-app/.env.local"
```

**Contenido del .zip de entrega:**
- Todo el código fuente en `metro-app/`
- Archivos de configuración
- Scripts de prueba en `__tests__/`
- Documentación en `docs/`
- Excluye: `node_modules/`, `.next/`, variables de entorno locales

---

## 3. Despliegue en Vercel — Paso a Paso

### 3.1 Prerrequisitos

1. Cuenta en [vercel.com](https://vercel.com)
2. Repositorio en GitHub con el código del proyecto
3. Base de datos PostgreSQL en la nube (Neon o Supabase)
4. Instancia Redis en [upstash.com](https://upstash.com)

### 3.2 Crear base de datos PostgreSQL (Neon)

```
1. Ir a https://neon.tech y crear cuenta
2. Crear nuevo proyecto: "metro-medellin"
3. Crear base de datos: "metro_medellin"
4. Copiar el "Connection string" (formato postgresql://...)
```

### 3.3 Desplegar en Vercel

```
1. Ir a https://vercel.com/new
2. Importar el repositorio de GitHub
3. Configurar:
   - Framework Preset: Next.js
   - Root Directory: metro-app
   - Build Command: npm run build (automático)
   - Install Command: npm install && npx prisma generate
4. Agregar variables de entorno (ver sección 3.4)
5. Click en "Deploy"
```

### 3.4 Variables de entorno en Vercel

Configurar en `Settings > Environment Variables`:

| Variable | Valor de ejemplo | Obligatoria |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | ✅ |
| `NEXTAUTH_URL` | `https://metro-medellin.vercel.app` | ✅ |
| `NEXTAUTH_SECRET` | _(secreto de 32+ caracteres)_ | ✅ |
| `AUTH_SECRET` | _(igual que NEXTAUTH_SECRET)_ | ✅ |
| `UPSTASH_REDIS_REST_URL` | `https://su-instancia.upstash.io` | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | _(token de Upstash)_ | ✅ |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | _(clave pública VAPID)_ | ⬜ |
| `VAPID_PRIVATE_KEY` | _(clave privada VAPID)_ | ⬜ |
| `VAPID_SUBJECT` | `mailto:admin@metro.local` | ⬜ |
| `NODE_ENV` | `production` | ✅ |

### 3.5 Inicializar base de datos en producción

Tras el primer despliegue, ejecutar desde el equipo local apuntando a la BD de producción:

```bash
# Exportar la URL de producción temporalmente
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Aplicar migraciones
npx prisma migrate deploy

# Cargar datos iniciales (estaciones y líneas)
npx prisma db seed
```

---

## 4. Generación de Claves VAPID (Web Push)

```bash
# Instalar web-push globalmente
npm install -g web-push

# Generar par de claves VAPID
npx web-push generate-vapid-keys
```

**Salida esperada:**
```
=======================================
Public Key:
BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Private Key:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
=======================================
```

Copiar estos valores a las variables de entorno correspondientes.

---

## 5. Comandos de Despliegue con Vercel CLI

```bash
# Instalar CLI de Vercel
npm install -g vercel

# Autenticarse
vercel login

# Desplegar en preview
vercel

# Desplegar en producción
vercel --prod

# Ver logs del deployment
vercel logs <deployment-url>

# Ver variables de entorno configuradas
vercel env ls
```

---

## 6. Verificación Post-Despliegue

Lista de verificación tras desplegar:

| Verificación | Cómo comprobar |
|---|---|
| Landing page carga | Abrir `https://metro-medellin.vercel.app` |
| Registro funciona | Registrar usuario de prueba |
| Login funciona | Iniciar sesión con usuario de prueba |
| Módulo Rutas | Buscar ruta entre dos estaciones |
| Módulo Mapa | Abrir mapa e interactuar con estaciones |
| Módulo Tarjeta | Consultar saldo (requiere login) |
| Módulo Alertas | Verificar lista de alertas y conexión SSE |
| API Estaciones | `GET /api/estaciones` retorna 28 estaciones |
| Base de datos | `npx prisma studio` conecta a BD de producción |

---

## 7. Historial de Deployments

| Commit | Descripción | Ambiente |
|---|---|---|
| `5e2312b` | first commit — estructura base del proyecto | Development |
| `7fee058` | finish to evidence — módulos completos | Preview |
| `eba7c75` | finish to evidence — documentación y pruebas | Production |

---

## 8. Rollback en caso de error

```bash
# Ver lista de deployments anteriores
vercel ls

# Promover un deployment anterior a producción
vercel promote <deployment-url>
```

O desde el dashboard de Vercel: `Deployments > [deployment anterior] > ... > Promote to Production`

---

## 9. Monitoreo

| Herramienta | URL | Descripción |
|---|---|---|
| **Vercel Analytics** | Dashboard de Vercel | Métricas de rendimiento y errores |
| **Vercel Functions** | Logs en tiempo real de API Routes |
| **Prisma Studio** (BD prod) | `npx prisma studio` con `DATABASE_URL` de prod | Inspección visual de la BD |
| **Upstash Console** | `https://console.upstash.com` | Monitoreo de Redis y rate limiting |
