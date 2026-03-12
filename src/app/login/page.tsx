'use client';

import LoginForm from '../components/LoginForm';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const validarSesion = async () => {
      try {
        const res = await fetch('/api/check', {
          method: 'GET',
          credentials: 'include', // manda la cookie al backend
        });

        if (res.status === 200) {
          setIsAuthenticated(true);
          router.replace('/dashboard');
        } else {
          setIsAuthenticated(false);
        }

      } catch (err) {
        console.error('Error al validar sesión:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validarSesion();

  }, [router]);

  if (isLoading) return (
    <>
      <div className="flex justify-center items-center h-screen bg-white/80 animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    </>
  );

  if (!isAuthenticated) return <LoginForm />; // Si se autenticó, ya redirigió
  return null;
}
