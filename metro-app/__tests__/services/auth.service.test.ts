/**
 * Pruebas unitarias - Servicio de Autenticación
 * Verifica el registro y búsqueda de usuarios
 */

// Mock del cliente de Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock de bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("$2a$12$hashed_password"),
}));

import { registerUser, getUserByEmail } from "@/services/auth.service";
import { prisma } from "@/lib/prisma";

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("debe crear un usuario correctamente", async () => {
      // Arrange: simular que el email no existe
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: "cuid123",
        name: "Juan Pérez",
        email: "juan@test.com",
        hashedPassword: "$2a$12$hashed_password",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await registerUser(
        "Juan Pérez",
        "juan@test.com",
        "Password123"
      );

      // Assert: no debe incluir el hash de la contraseña
      expect(result).not.toHaveProperty("hashedPassword");
      expect(result.email).toBe("juan@test.com");
      expect(result.name).toBe("Juan Pérez");
    });

    it("debe lanzar error si el email ya existe", async () => {
      // Arrange: simular que el email ya existe
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "existing",
        email: "juan@test.com",
      });

      // Act & Assert
      await expect(
        registerUser("Juan Pérez", "juan@test.com", "Password123")
      ).rejects.toThrow("El correo electrónico ya está registrado");
    });
  });

  describe("getUserByEmail", () => {
    it("debe retornar el usuario si existe", async () => {
      const mockUser = { id: "cuid123", email: "juan@test.com" };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserByEmail("juan@test.com");
      expect(result).toEqual(mockUser);
    });

    it("debe retornar null si no existe", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getUserByEmail("noexiste@test.com");
      expect(result).toBeNull();
    });
  });
});
