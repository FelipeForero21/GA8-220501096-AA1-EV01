/**
 * Seed de la base de datos
 * Carga datos iniciales: líneas, estaciones y conexiones
 * del Metro de Medellín
 *
 * Ejecutar con: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de la base de datos...");

  // ---- Crear Líneas del Metro ----
  const lineA = await prisma.line.upsert({
    where: { code: "A" },
    update: {},
    create: {
      name: "Línea A",
      code: "A",
      color: "#0072BC",
      type: "METRO",
    },
  });

  const lineB = await prisma.line.upsert({
    where: { code: "B" },
    update: {},
    create: {
      name: "Línea B",
      code: "B",
      color: "#F7941D",
      type: "METRO",
    },
  });

  const lineTA = await prisma.line.upsert({
    where: { code: "T-A" },
    update: {},
    create: {
      name: "Tranvía de Ayacucho",
      code: "T-A",
      color: "#7B2D8E",
      type: "TRAM",
    },
  });

  const lineK = await prisma.line.upsert({
    where: { code: "K" },
    update: {},
    create: {
      name: "Metrocable Línea K",
      code: "K",
      color: "#009A44",
      type: "CABLE",
    },
  });

  const lineJ = await prisma.line.upsert({
    where: { code: "J" },
    update: {},
    create: {
      name: "Metrocable Línea J",
      code: "J",
      color: "#FFC107",
      type: "CABLE",
    },
  });

  // ---- Crear Estaciones Línea A (Niquía - La Estrella) ----
  const stationsLineA = [
    { name: "Niquía", code: "NQ", order: 1, lat: 6.3378, lng: -75.5440 },
    { name: "Bello", code: "BL", order: 2, lat: 6.3342, lng: -75.5560 },
    { name: "Madera", code: "MD", order: 3, lat: 6.3220, lng: -75.5530 },
    { name: "Acevedo", code: "AC", order: 4, lat: 6.3107, lng: -75.5570, isTransfer: true },
    { name: "Tricentenario", code: "TR", order: 5, lat: 6.2987, lng: -75.5630 },
    { name: "Caribe", code: "CR", order: 6, lat: 6.2880, lng: -75.5660 },
    { name: "Universidad", code: "UN", order: 7, lat: 6.2703, lng: -75.5678 },
    { name: "Hospital", code: "HP", order: 8, lat: 6.2619, lng: -75.5703 },
    { name: "Prado", code: "PR", order: 9, lat: 6.2530, lng: -75.5690 },
    { name: "Parque Berrío", code: "PB", order: 10, lat: 6.2478, lng: -75.5690 },
    { name: "San Antonio", code: "SA", order: 11, lat: 6.2467, lng: -75.5698, isTransfer: true },
    { name: "Alpujarra", code: "AL", order: 12, lat: 6.2440, lng: -75.5740 },
    { name: "Exposiciones", code: "EX", order: 13, lat: 6.2383, lng: -75.5760 },
    { name: "Industriales", code: "IN", order: 14, lat: 6.2310, lng: -75.5780 },
    { name: "Poblado", code: "PO", order: 15, lat: 6.2108, lng: -75.5783 },
    { name: "Aguacatala", code: "AG", order: 16, lat: 6.1977, lng: -75.5830 },
    { name: "Ayurá", code: "AY", order: 17, lat: 6.1870, lng: -75.5870 },
    { name: "Envigado", code: "EN", order: 18, lat: 6.1730, lng: -75.5900 },
    { name: "Itagüí", code: "IT", order: 19, lat: 6.1630, lng: -75.6000 },
    { name: "Sabaneta", code: "SB", order: 20, lat: 6.1510, lng: -75.6160 },
    { name: "La Estrella", code: "LE", order: 21, lat: 6.1410, lng: -75.6300 },
  ];

  for (const s of stationsLineA) {
    await prisma.station.upsert({
      where: { code: s.code },
      update: {},
      create: {
        name: s.name,
        code: s.code,
        lineId: lineA.id,
        order: s.order,
        latitude: s.lat,
        longitude: s.lng,
        isTransfer: s.isTransfer ?? false,
      },
    });
  }

  // ---- Crear Estaciones Línea B (San Antonio - San Javier) ----
  const stationsLineB = [
    { name: "San Antonio", code: "SA-B", order: 1, lat: 6.2467, lng: -75.5698, isTransfer: true },
    { name: "Cisneros", code: "CI", order: 2, lat: 6.2490, lng: -75.5740 },
    { name: "Suramericana", code: "SU", order: 3, lat: 6.2510, lng: -75.5830 },
    { name: "Estadio", code: "ES", order: 4, lat: 6.2530, lng: -75.5900 },
    { name: "Floresta", code: "FL", order: 5, lat: 6.2560, lng: -75.5990 },
    { name: "Santa Lucía", code: "SL", order: 6, lat: 6.2570, lng: -75.6080 },
    { name: "San Javier", code: "SJ", order: 7, lat: 6.2567, lng: -75.6170, isTransfer: true },
  ];

  for (const s of stationsLineB) {
    await prisma.station.upsert({
      where: { code: s.code },
      update: {},
      create: {
        name: s.name,
        code: s.code,
        lineId: lineB.id,
        order: s.order,
        latitude: s.lat,
        longitude: s.lng,
        isTransfer: s.isTransfer ?? false,
      },
    });
  }

  console.log("Seed completado exitosamente.");
  console.log(`  - Líneas: ${5}`);
  console.log(`  - Estaciones Línea A: ${stationsLineA.length}`);
  console.log(`  - Estaciones Línea B: ${stationsLineB.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error en seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
