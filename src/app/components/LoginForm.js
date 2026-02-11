'use client'


import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import Footer from './Footer'


export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Only show 'Sesión vencida' if redirected with ?expired=1
  // Solo mostrar "Sesión vencida" si viene de ?expired=1, y limpiar error si el usuario interactúa
  useEffect(() => {
    if (searchParams && searchParams.get('expired') === '1') {
      setError('Sesión vencida. Por favor, inicie sesión nuevamente.');
    } else {
      setError(null);
    }
    // Limpiar error si el usuario empieza a escribir
    const clearOnInput = () => {
      if (error) setError(null);
    };
    const usuario = document.getElementById('usuario');
    const clave = document.getElementById('clave');
    usuario?.addEventListener('input', clearOnInput);
    clave?.addEventListener('input', clearOnInput);
    return () => {
      usuario?.removeEventListener('input', clearOnInput);
      clave?.removeEventListener('input', clearOnInput);
    };
    // eslint-disable-next-line
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    // Siempre limpiar error al intentar login (menos si es sesión vencida)
    if (!searchParams || searchParams.get('expired') !== '1') {
      setError(null);
    }
    toast.dismiss();

    const usuario = e.currentTarget.usuario.value.trim();
    const clave = e.currentTarget.clave.value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, clave }),
        credentials: 'include',
      });

      if (res.status === 401) {
        let errorMsg = 'Datos de inicio de sesión incorrectos';
        try {
          const data = await res.json();
          errorMsg = data.message || errorMsg; // Intenta leer el JSON de Spring
        } catch (e) {
          // Si Spring no devolvió JSON, usa el mensaje por defecto
        }
        setError(errorMsg);
        return;
      }

      // 2. Manejo de otros errores (500, 404, 403)
      if (!res.ok) {
        let msg = 'Error inesperado en el servidor';
        try {
          const data = await res.json();
          msg = data?.message || msg;
        } catch {}
        setError(msg);
        toast.error(msg);
        return;
      }

      // 3. Éxito
      toast.success('Bienvenido');
      router.push('/dashboard');

    } catch (err) {
      // Aquí solo entrará si el contenedor de Next no puede llegar al de Spring (Error 502/504 real)
      console.error('Error físico de conexión:', err);
      setError('Datos de inicio de sesión incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header ARCA-like */}
      <header className="h-16 bg-[#1E2A4A] text-white shrink-0">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-center px-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-extrabold tracking-wide">SIG</div>
            <div className="h-6 w-px bg-white/30" />
            <div className="text-xs leading-tight text-white/90">
              <div className="font-semibold tracking-wide">SISTEMA DE IMPUESTOS</div>
              <div className="tracking-wide">A LAS GANANCIAS</div>
            </div>
          </div>
        </div>
      </header>

      {/* Background */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/03.jpg')" }}
        />
        <div className="absolute inset-0 backdrop-blur-[6px]  bg-black/30" />


        {/* patrón sutil */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(60rem 30rem at 70% 30%, rgba(255,255,255,.12), transparent 60%), linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 35%), repeating-linear-gradient(135deg, rgba(255,255,255,.04) 0 2px, transparent 2px 10px)',
            backgroundBlendMode: 'screen, normal, normal',
          }}
        />

        {/* Card */}
        <div className="relative w-full max-w-[420px] rounded-lg bg-white shadow-[0_18px_45px_rgba(0,0,0,.35)]">
          <div className="px-10 pt-10 pb-6">

            <div className="flex flex-col items-center gap-3 text-slate-900">

              <img
                src="/escudo_chubut.webp"
                alt="Escudo institucional"
                className="h-20 w-auto opacity-90"
              />
            </div>

            <div className="flex items-center gap-2 text-slate-900 pt-8">

              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white">
                <FiLock className="text-slate-700" />
              </span>
              <h1 className="text-lg font-semibold">Iniciar sesión</h1>
            </div>

            <form onSubmit={handleLogin} className="mt-4 space-y-5">

              <div>
                <label htmlFor="usuario" className="block text-xs font-semibold tracking-wider text-slate-700">
                  Usuario
                </label>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  required
                  autoComplete="username"
                  className="mt-2 w-full rounded border text-gray-800 border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-200"
                  placeholder=""
                />
              </div>

              <div>
                <label htmlFor="clave" className="block text-xs font-semibold tracking-wider text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="clave"
                    name="clave"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="mt-2 w-full rounded border text-gray-800 border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-200 pr-10"
                    placeholder=""
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className={`w-full rounded bg-[#0ea5e9] py-2.5 text-sm font-semibold text-white transition
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#0284c7]'}
                `}
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Ingresando…
                  </span>
                ) : (
                  'Ingresar'
                )}
              </button>



              <div className="border-t pt-5">



              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer dark={true} />
    </div>
  )
}
