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

const ROL_KEY = "sig_rol";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const loggingOut = useRef(false);
  const [rol, setRolState] = useState<string>("");

  // Wrapper: persiste en localStorage para sobrevivir cierre de ventana
  const setRol = useCallback((newRol: string) => {
    setRolState(newRol);
    if (typeof window !== "undefined") {
      if (newRol) localStorage.setItem(ROL_KEY, newRol);
      else localStorage.removeItem(ROL_KEY);
    }
  }, []);

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
    [router, setRol]
  );

  // Cargar rol al montar: siempre desde localStorage (instantáneo, sin red),
  // y validar con el backend solo si no estamos en /login
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Leer rol desde localStorage (sobrevive cierre del navegador, sin expiración)
    const rolFromStorage = localStorage.getItem(ROL_KEY) || "";
    // 2. Fallback: leer desde cookie
    const match = document.cookie.match(/(?:^|;\s*)rol=([^;]*)/);
    const rolFromCookie = match ? decodeURIComponent(match[1]) : "";
    const initialRol = rolFromStorage || rolFromCookie;
    if (initialRol) setRolState(initialRol); // setRolState directo para no re-escribir localStorage

    // 3. Validar con el backend solo fuera del login (evita llamada innecesaria)
    const path = window.location.pathname;
    if (path === "/login") return;

    fetch("/api/verificar-sesion", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.rol) setRol(data.rol);
      })
      .catch(() => {});
  }, [setRol]);

  // Ref estable para usar dentro del interceptor
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = window.location.pathname;
    if (path === "/login") return;

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