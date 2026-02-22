/**
 * Servicio de Autenticación
 * Maneja el registro de usuarios con cifrado de contraseñas
 */

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/** Número de rondas de salt para bcrypt (según spec de seguridad) */
const SALT_ROUNDS = 12;

/**
 * Registra un nuevo usuario en el sistema
 * @param name - Nombre completo del usuario
 * @param email - Correo electrónico (único)
 * @param password - Contraseña en texto plano (se cifra antes de guardar)
 * @returns Usuario creado (sin la contraseña hasheada)
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<Omit<User, "hashedPassword">> {
  // Verificar si el correo ya está registrado
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("El correo electrónico ya está registrado");
  }

  // Cifrar la contraseña con bcrypt y salt de 12 rondas
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Crear el usuario en la base de datos
  const user = await prisma.user.create({
    data: { name, email, hashedPassword },
  });

  // Retornar sin el hash de la contraseña
  const { hashedPassword: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Busca un usuario por su correo electrónico
 * @param email - Correo del usuario
 * @returns Usuario encontrado o null
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}
