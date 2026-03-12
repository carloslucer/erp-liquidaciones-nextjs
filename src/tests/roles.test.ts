/**
 * TEST 1-3: Lógica de permisos por rol (src/app/lib/roles.ts)
 *
 * Verifica que cada función de permiso retorne el valor correcto
 * para cada rol del sistema.
 */
import { describe, it, expect } from "vitest";
import {
  ROLES,
  puedeVisualizar,
  puedeLiquidar,
  puedeSubirArchivos,
  puedeDescargar,
  puedeAdministrarUsuarios,
} from "@/app/lib/roles";

describe("puedeVisualizar", () => {
  it("retorna true para todos los roles definidos", () => {
    expect(puedeVisualizar(ROLES.ADMIN)).toBe(true);
    expect(puedeVisualizar(ROLES.LIQUIDADOR)).toBe(true);
    expect(puedeVisualizar(ROLES.CONTADOR)).toBe(true);
    expect(puedeVisualizar(ROLES.CLIENTE)).toBe(true);
  });

  it("retorna false para un rol inexistente", () => {
    expect(puedeVisualizar("ROL_INEXISTENTE")).toBe(false);
    expect(puedeVisualizar("")).toBe(false);
  });
});

describe("puedeLiquidar", () => {
  it("retorna true solo para ADMIN y LIQUIDADOR", () => {
    expect(puedeLiquidar(ROLES.ADMIN)).toBe(true);
    expect(puedeLiquidar(ROLES.LIQUIDADOR)).toBe(true);
  });

  it("retorna false para CONTADOR y CLIENTE", () => {
    expect(puedeLiquidar(ROLES.CONTADOR)).toBe(false);
    expect(puedeLiquidar(ROLES.CLIENTE)).toBe(false);
  });
});

describe("puedeSubirArchivos", () => {
  it("retorna true solo para ADMIN y LIQUIDADOR", () => {
    expect(puedeSubirArchivos(ROLES.ADMIN)).toBe(true);
    expect(puedeSubirArchivos(ROLES.LIQUIDADOR)).toBe(true);
  });

  it("retorna false para CONTADOR y CLIENTE", () => {
    expect(puedeSubirArchivos(ROLES.CONTADOR)).toBe(false);
    expect(puedeSubirArchivos(ROLES.CLIENTE)).toBe(false);
  });
});

describe("puedeDescargar", () => {
  it("retorna true para todos los roles definidos", () => {
    Object.values(ROLES).forEach((rol) => {
      expect(puedeDescargar(rol)).toBe(true);
    });
  });
});

describe("puedeAdministrarUsuarios", () => {
  it("retorna true solo para ADMIN", () => {
    expect(puedeAdministrarUsuarios(ROLES.ADMIN)).toBe(true);
  });

  it("retorna false para todos los demás roles", () => {
    expect(puedeAdministrarUsuarios(ROLES.LIQUIDADOR)).toBe(false);
    expect(puedeAdministrarUsuarios(ROLES.CONTADOR)).toBe(false);
    expect(puedeAdministrarUsuarios(ROLES.CLIENTE)).toBe(false);
  });
});
