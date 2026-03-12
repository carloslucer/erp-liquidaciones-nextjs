/**
 * TEST 4-5: RoleGuard (src/app/components/RoleGuard.tsx)
 *
 * Verifica que el componente renderice el contenido protegido
 * cuando el rol coincide, y redirija cuando no coincide.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RoleGuard from "@/app/components/RoleGuard";

// Mock del contexto de sesión
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Controlamos el rol que devuelve useSession
let mockRol = "";
vi.mock("@/app/contexts/SessionContext", () => ({
  useSession: () => ({ rol: mockRol }),
}));

beforeEach(() => {
  mockReplace.mockClear();
});

describe("RoleGuard", () => {
  it("TEST 4 – renderiza el children cuando el rol está en la lista permitida", async () => {
    mockRol = "ADMINISTRADOR";
    render(
      <RoleGuard allowedRoles={["ADMINISTRADOR", "LIQUIDADOR"]}>
        <div>Contenido protegido</div>
      </RoleGuard>
    );

    await waitFor(() => {
      expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("TEST 5 – redirige a /dashboard cuando el rol NO está en la lista permitida", async () => {
    mockRol = "CLIENTE";
    render(
      <RoleGuard allowedRoles={["ADMINISTRADOR", "LIQUIDADOR"]}>
        <div>Contenido protegido</div>
      </RoleGuard>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });
});
