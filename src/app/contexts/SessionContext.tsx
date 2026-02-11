"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type SessionContextType = {
  logout: (reason?: string) => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

function usePersistentCallback<T extends (...args: any[]) => any>(cb: T) {
  const ref = useRef(cb);
  ref.current = cb;
  return useCallback((...args: Parameters<T>) => ref.current(...args), []);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isLoggingOutRef = useRef(false);

  const logoutImpl = useCallback(
    async (reason?: string) => {
      if (isLoggingOutRef.current) {

        return;
      }
      isLoggingOutRef.current = true;
  
      try {
        // We don't care about the result of the logout API call
        await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
        }).catch(() => {});
      } finally {
        if (reason) {
          toast.error(reason);
        } else {
          toast.success("Sesión finalizada");
        }
      
        router.push("/login");
        isLoggingOutRef.current = false;
      }
    },
    [router]
  );

  const logout = usePersistentCallback(logoutImpl);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch.bind(window);
    const LOGOUT_MESSAGE =
      "Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.";

    // --- INTERCEPTOR DE FETCH ---
    // Intercepta TODAS las llamadas fetch para detectar 401.
    const patchedFetch: typeof fetch = async (
      input,
      init: RequestInit & { __retry?: boolean } = {}
    ) => {
      // Evita interceptar las llamadas que hace la propia función de logout
      if (String(input).includes("/api/logout")) {
        return originalFetch(input, init);
      }

      const response = await originalFetch(input, init);

        if (response.status === 401 && !init.__retry) {
      
        await logout(LOGOUT_MESSAGE);

        // ✅ Cortamos correctamente el flujo
        throw new Error("SESSION_EXPIRED");
      }


      return response;
    };
    
    window.fetch = patchedFetch;

    // --- VERIFICACIÓN PERIÓDICA ---
    // Como fallback, verifica la sesión periódicamente por si el usuario está inactivo.
    let intervalId: NodeJS.Timeout | null = null;
    
    const checkSession = async () => {
      try {
        const res = await fetch("/api/verificar-sesion");
        if (!res.ok) {

          await logout(LOGOUT_MESSAGE);
        }
      } catch (error) {

      }
    };

    // Inicia la verificación
    if (window.location.pathname === "/login") return;
    checkSession();
    intervalId = setInterval(checkSession, 5 * 60 * 1000); // cada 5 minutos

    // Cleanup
    return () => {
      window.fetch = originalFetch;
      if (intervalId) clearInterval(intervalId);
    };
  }, [logout]);

  return <SessionContext.Provider value={{ logout }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider");
  return ctx;
}