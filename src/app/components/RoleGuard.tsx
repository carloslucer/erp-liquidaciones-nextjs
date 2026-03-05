"use client";

import { useSession } from "@/app/contexts/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Componente que protege rutas según el rol del usuario.
 * Si el rol no coincide con ninguno de los permitidos, redirige a /dashboard.
 *
 * @param allowedRoles - Lista de roles permitidos (ej: ["ADMINISTRADOR", "LIQUIDADOR"])
 * @param children - Contenido a renderizar si tiene acceso
 */
export default function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: React.ReactNode;
}) {
  const { rol } = useSession();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Esperar a que el rol se resuelva (viene de verificar-sesion)
    if (!rol) return;

    if (!allowedRoles.includes(rol)) {
      router.replace("/dashboard");
    } else {
      setChecked(true);
    }
  }, [rol, allowedRoles, router]);

  // Mientras no se resolvió el rol, mostrar vacío (evita flash)
  if (!checked) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="erp-loader">
          <div className="erp-dot" />
          <div className="erp-dot" />
          <div className="erp-dot" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
