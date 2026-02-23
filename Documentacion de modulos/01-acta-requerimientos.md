# Acta de Aprobación de Requerimientos
## Sistema de Información Web — Metro de Medellín

---

| Campo | Detalle |
|---|---|
| **Proyecto** | Aplicación Web Metro de Medellín |
| **Actividad** | GA8-220501096-AA1-EV01 |
| **Programa** | Análisis y Desarrollo de Software |
| **Fecha de elaboración** | 22 de febrero de 2026 |
| **Estado** | Aprobado |

---

## 1. Descripción General del Sistema

Desarrollo de una aplicación web para el Metro de Medellín que permita a los ciudadanos consultar rutas, visualizar el mapa de la red, gestionar su Tarjeta Cívica y recibir notificaciones de alertas en tiempo real.

---

## 2. Requerimientos Funcionales

| ID | Módulo | Requerimiento | Prioridad | Estado |
|---|---|---|---|---|
| RF-01 | Rutas | El sistema debe permitir buscar la ruta más corta entre dos estaciones usando BFS | Alta | ✅ Aprobado |
| RF-02 | Rutas | El sistema debe mostrar los transbordos, tiempo estimado y distancia total | Alta | ✅ Aprobado |
| RF-03 | Rutas | El sistema debe mostrar los horarios de operación según el día | Media | ✅ Aprobado |
| RF-04 | Mapa | El sistema debe mostrar un mapa SVG interactivo de la red del metro | Alta | ✅ Aprobado |
| RF-05 | Mapa | El mapa debe soportar zoom y paneo | Alta | ✅ Aprobado |
| RF-06 | Mapa | Al seleccionar una estación debe mostrarse un panel con su información | Media | ✅ Aprobado |
| RF-07 | Tarjeta | El sistema debe permitir consultar el saldo de la Tarjeta Cívica | Alta | ✅ Aprobado |
| RF-08 | Tarjeta | El sistema debe mostrar el historial de viajes paginado | Alta | ✅ Aprobado |
| RF-09 | Tarjeta | El sistema debe permitir recargar saldo mediante pasarela de pago | Alta | ✅ Aprobado |
| RF-10 | Tarjeta | El módulo de tarjeta requiere autenticación del usuario | Alta | ✅ Aprobado |
| RF-11 | Alertas | El sistema debe mostrar alertas activas en tiempo real | Alta | ✅ Aprobado |
| RF-12 | Alertas | Las alertas deben llegar por Server-Sent Events (SSE) sin recargar la página | Alta | ✅ Aprobado |
| RF-13 | Alertas | El sistema debe soportar notificaciones Web Push al navegador | Media | ✅ Aprobado |
| RF-14 | Auth | El sistema debe permitir registro e inicio de sesión con email y contraseña | Alta | ✅ Aprobado |

---

## 3. Requerimientos No Funcionales

| ID | Requerimiento | Criterio de Aceptación | Estado |
|---|---|---|---|
| RNF-01 | Seguridad — JWT | Tokens con expiración de 24 horas | ✅ Aprobado |
| RNF-02 | Seguridad — Contraseñas | Cifrado bcrypt con 12 salt rounds | ✅ Aprobado |
| RNF-03 | Seguridad — Rutas | Middleware protege `/tarjeta/*` sin autenticación | ✅ Aprobado |
| RNF-04 | Seguridad — Rate Limiting | Máximo 10 peticiones por ventana de 10 segundos | ✅ Aprobado |
| RNF-05 | Validación | Todas las entradas de API validadas con Zod | ✅ Aprobado |
| RNF-06 | Rendimiento — Caché | Respuestas de estaciones cacheadas en Redis | ✅ Aprobado |
| RNF-07 | Código | TypeScript estricto en todos los archivos | ✅ Aprobado |
| RNF-08 | Código | Patrón Repository para acceso a datos | ✅ Aprobado |
| RNF-09 | Pruebas | Prueba unitaria Jest para cada servicio | ✅ Aprobado |
| RNF-10 | CI/CD | Pipeline automático de lint, test y build | ✅ Aprobado |

---

## 4. Restricciones Técnicas

- Framework: **Next.js 14** con App Router
- Base de datos: **PostgreSQL** administrada con **Prisma ORM**
- Autenticación: **NextAuth.js v5** (no se permite autenticación personalizada)
- Caché: **Upstash Redis** (servicio en la nube)
- Estilos: **Tailwind CSS** + componentes **shadcn/ui**
- Pruebas: **Jest** + **React Testing Library** (no otro framework de testing)

---

## 5. Criterios de Aceptación Global

El sistema se considera aceptado cuando:

1. Los 4 módulos (Rutas, Mapa, Tarjeta, Alertas) funcionan correctamente en producción.
2. Todas las pruebas unitarias pasan con cobertura mayor al 70%.
3. El pipeline de CI/CD ejecuta sin errores en GitHub Actions.
4. La aplicación está desplegada y accesible en una URL pública.
5. No existen vulnerabilidades críticas de seguridad.

---

## 6. Firmas de Aprobación

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Aprendiz | _(Nombre del aprendiz)_ | 22/02/2026 | ________________ |
| Instructor | _(Nombre del instructor)_ | 22/02/2026 | ________________ |

---

> Documento generado para la actividad de aprendizaje GA8-220501096-AA1-EV01
> Programa de Análisis y Desarrollo de Software — SENA
