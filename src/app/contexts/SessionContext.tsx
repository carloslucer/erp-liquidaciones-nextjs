"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type SessionContextType = {
  logout: (reason?: string) => Promise<void>;
  rol: string;
  setRol: (rol: string) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const LOGOUT_MESSAGE =
  "Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const loggingOut = useRef(false);
  const [rol, setRol] = useState<string>("");

  const logout = useCallback(
    async (reason?: string) => {
      if (loggingOut.current) return;
      loggingOut.current = true;

      try {
        await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
        }).catch(() => {});
      } finally {
        setRol("");
        toast[reason ? "error" : "success"](reason || "Sesión finalizada");
        router.push("/login");
        setTimeout(() => { loggingOut.current = false; }, 1000);
      }
    },
    [router]
  );

  // Cargar rol al montar (desde verificar-sesion)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    if (path === "/login" || path === "/") return;

    fetch("/api/verificar-sesion", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.rol) setRol(data.rol);
      })
      .catch(() => {});
  }, []);

  // Ref estable para usar dentro del interceptor
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = window.location.pathname;
    if (path === "/login" || path === "/") return;

    // ═══════════════════════════════════════════
    // ÚNICO MECANISMO: Interceptor de fetch → 401 = logout
    // El backend ES la fuente de verdad.
    // Cada request que hagas ya valida el token.
    // ═══════════════════════════════════════════
    const originalFetch = window.fetch.bind(window);
    const skipUrls = ["/api/logout", "/api/login", "/api/auth/usuarios", "/api/auth/register"];

    window.fetch = async (input, init?: RequestInit) => {
      const response = await originalFetch(input, init);
      const url = typeof input === "string" ? input : (input as Request).url;

      if (
        response.status === 401 &&
        !skipUrls.some((s) => url.includes(s))
      ) {
        logoutRef.current(LOGOUT_MESSAGE);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <SessionContext.Provider value={{ logout, rol, setRol }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider");
  return ctx;
}