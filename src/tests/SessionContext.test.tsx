/**
 * TEST 8: SessionContext – logout
 *
 * Verifica que al llamar logout() se haga POST a /api/logout
 * y se redirija al usuario a /login.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { SessionProvider, useSession } from "@/app/contexts/SessionContext";
import React from "react";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

// Componente auxiliar que captura logout del contexto
let capturedLogout: ((reason?: string) => Promise<void>) | null = null;
function TestConsumer() {
  const { logout } = useSession();
  capturedLogout = logout;
  return null;
}

describe("SessionContext", () => {
  beforeEach(() => {
    mockPush.mockClear();
    capturedLogout = null;
  });

  it("TEST 8 – logout llama a /api/logout y redirige a /login", async () => {
    // Instalamos el fetch mock ANTES de montar el componente
    // El contexto instala su propio interceptor encima; lo nuestro es
    // verificar que el endpoint correcto se llame, así que usamos
    // un mock en window.fetch que el interceptor también propagará.
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, { status: 200 })
    );
    // El SessionContext reemplaza window.fetch, así que mockeamos
    // el fetch global ANTES del render para que el interceptor lo tome.
    vi.stubGlobal("fetch", fetchMock);

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    );

    await act(async () => {
      await capturedLogout!();
    });

    // Verificar que alguna llamada fue hacia /api/logout con método POST
    const logoutCall = fetchMock.mock.calls.find(
      ([url, opts]: [string, RequestInit]) =>
        typeof url === "string" &&
        url.includes("/api/logout") &&
        opts?.method === "POST"
    );
    expect(logoutCall).toBeDefined();
    expect(mockPush).toHaveBeenCalledWith("/login");

    vi.unstubAllGlobals();
  });
});
