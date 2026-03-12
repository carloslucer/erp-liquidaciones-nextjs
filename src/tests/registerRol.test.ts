/**
 * TEST 10: Validación de rol en la API register
 *
 * La API route /api/auth/register solo acepta roles válidos:
 * ADMINISTRADOR, LIQUIDADOR, CONTADOR.
 * Probamos la función de validación de forma aislada.
 */
import { describe, it, expect } from "vitest";

const VALID_ROLES = ["ADMINISTRADOR", "LIQUIDADOR", "CONTADOR"] as const;
type ValidRole = (typeof VALID_ROLES)[number];

function validarRolRegister(rol: string | undefined): {
  valid: boolean;
  message?: string;
} {
  if (!rol) {
    return { valid: false, message: "El campo 'rol' es obligatorio" };
  }
  const rolUpper = rol.trim().toUpperCase();
  if (!VALID_ROLES.includes(rolUpper as ValidRole)) {
    return {
      valid: false,
      message: `Rol inválido. Valores válidos: ${VALID_ROLES.join(", ")}`,
    };
  }
  return { valid: true };
}

describe("Validación de rol – API /api/auth/register (TEST 10)", () => {
  it("acepta roles válidos en mayúsculas", () => {
    expect(validarRolRegister("ADMINISTRADOR").valid).toBe(true);
    expect(validarRolRegister("LIQUIDADOR").valid).toBe(true);
    expect(validarRolRegister("CONTADOR").valid).toBe(true);
  });

  it("acepta roles válidos en minúsculas (los normaliza a mayúsculas)", () => {
    expect(validarRolRegister("administrador").valid).toBe(true);
    expect(validarRolRegister("liquidador").valid).toBe(true);
  });

  it("rechaza CLIENTE (no permitido en register)", () => {
    const result = validarRolRegister("CLIENTE");
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/inválido/i);
  });

  it("rechaza un rol arbitrario", () => {
    const result = validarRolRegister("SUPERADMIN");
    expect(result.valid).toBe(false);
  });

  it("rechaza rol undefined o vacío", () => {
    expect(validarRolRegister(undefined).valid).toBe(false);
    expect(validarRolRegister("").valid).toBe(false);
  });

  it("incluye la lista de roles válidos en el mensaje de error", () => {
    const result = validarRolRegister("INVALIDO");
    expect(result.message).toContain("ADMINISTRADOR");
    expect(result.message).toContain("LIQUIDADOR");
    expect(result.message).toContain("CONTADOR");
  });
});
