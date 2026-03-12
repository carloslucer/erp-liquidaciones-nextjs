// app/api/verificar-sesion/route.js
import { cookies } from 'next/headers';

export async function GET() {
   const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return new Response(null, { status: 401 });
  }

  const backendBase = process.env.API_BASE_URL;
  const res = await fetch(`${backendBase}/api/auth/check`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });



  if (!res.ok) {
    return new Response(null, { status: 401 });
  }

  const data = await res.json().catch(() => ({}));
  const rol = data.rol || cookieStore.get('rol')?.value || '';

  return new Response(JSON.stringify({ ok: true, rol }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
