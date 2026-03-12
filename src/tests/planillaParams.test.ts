/**
 * TEST 9: Validación de parámetros en la API route de planilla
 *
 * La API route de planilla (/api/planilla) requiere los parámetros
 * `documento` y `periodo`. Probamos la lógica de validación
 * de forma aislada (sin montar el servidor Next.js).
 */
import { describe, it, expect } from "vitest";

/**
 * Función extraída de la lógica de validación de la route.
 * Valida que ambos parámetros estén presentes y no vacíos.
 */
function validarParamsPlanilla(
  documento: string | null,
  periodo: string | null
): { valid: boolean; error?: string } {
  if (!documento || !periodo) {
    return { valid: false, error: "Faltan parametros: documento y/o periodo" };
  }
  return { valid: true };
}

describe("Validación de parámetros – API /api/planilla (TEST 9)", () => {
  it("retorna válido cuando documento y periodo están presentes", () => {
    const result = validarParamsPlanilla("20123456789", "2024-01");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("retorna error cuando falta documento", () => {
    const result = validarParamsPlanilla(null, "2024-01");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/documento/i);
  });

  it("retorna error cuando falta periodo", () => {
    const result = validarParamsPlanilla("20123456789", null);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/periodo/i);
  });

  it("retorna error cuando ambos parámetros están ausentes", () => {
    const result = validarParamsPlanilla(null, null);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("retorna error cuando algún parámetro es string vacío", () => {
    const result = validarParamsPlanilla("", "2024-01");
    expect(result.valid).toBe(false);
  });
});
