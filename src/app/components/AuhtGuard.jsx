"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setAuthorized(true);
      router.replace("/principal")
    }
  }, [router]);

  if (!authorized) {
    return <div>Cargando...</div>; // o spinner
  }

  return children;
}
