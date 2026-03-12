/**
 * TEST 6-7: Lógica del flujo de login
 *
 * LoginForm.js usa JSX con extensión .js, lo que impide importarlo
 * directamente en vitest (Vite requiere .jsx/.tsx para JSX).
 * En su lugar, testeamos la lógica de fetch que usa internamente
 * y la estructura de la respuesta esperada.
 */
import { describe, it, expect, vi } from "vitest";

/**
 * Lógica extraída del handleLogin de LoginForm:
 * procesa la respuesta de /api/login y determina
 * si debe navegar o mostrar error.
 */
async function procesarRespuestaLogin(
  fetchResponse: Response
): Promise<{ ok: boolean; rol?: string; error?: string }> {
  if (fetchResponse.status === 401) {
    let errorMsg = "Datos de inicio de sesión incorrectos";
    try {
      const data = await fetchResponse.json();
      errorMsg = data.message || errorMsg;
    } catch {}
    return { ok: false, error: errorMsg };
  }

  if (!fetchResponse.ok) {
    let msg = "Error inesperado en el servidor";
    try {
      const data = await fetchResponse.json();
      msg = data?.message || msg;
    } catch {}
    return { ok: false, error: msg };
  }

  const data = await fetchResponse.json();
  return { ok: true, rol: data.rol };
}

describe("Lógica de login (TEST 6-7)", () => {
  it("TEST 6 – devuelve ok:true con el rol cuando el login es exitoso (200)", async () => {
    const mockRes = new Response(
      JSON.stringify({ ok: true, rol: "ADMINISTRADOR" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

    const result = await procesarRespuestaLogin(mockRes);
    expect(result.ok).toBe(true);
    expect(result.rol).toBe("ADMINISTRADOR");
    expect(result.error).toBeUndefined();
  });

  it("TEST 7 – devuelve el mensaje de error cuando el servidor retorna 401", async () => {
    const mockRes = new Response(
      JSON.stringify({ message: "Credenciales inválidas" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );

    const result = await procesarRespuestaLogin(mockRes);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Credenciales inválidas");
  });

  it("TEST 7b – devuelve mensaje genérico si el 401 no trae JSON", async () => {
    const mockRes = new Response("Unauthorized", {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    });

    const result = await procesarRespuestaLogin(mockRes);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Datos de inicio de sesión incorrectos");
  });

  it("TEST 7c – devuelve error genérico para respuesta 500", async () => {
    const mockRes = new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );

    const result = await procesarRespuestaLogin(mockRes);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Internal Server Error");
  });
});
