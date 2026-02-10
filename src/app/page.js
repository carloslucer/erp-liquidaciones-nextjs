'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validarSesion = async () => {
      try {
        const res = await fetch('/api/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.status === 200) {
          // Sesión válida, ir al dashboard
          router.replace('/dashboard');
        } else {
          // Sin sesión, ir al login
          router.replace('/login');
        }
      } catch (err) {
        console.error('Error al validar sesión:', err);
        // Error, ir al login por seguridad
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    validarSesion();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return null;
}




