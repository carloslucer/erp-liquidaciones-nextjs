"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UsuariosPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/usuarios/lista"); }, [router]);
  return null;
}
