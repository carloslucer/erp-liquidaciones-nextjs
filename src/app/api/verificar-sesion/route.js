// app/api/verificar-sesion/route.js
import { cookies } from 'next/headers';

export async function GET() {
   const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return new Response(null, { status: 401 });
  }

  const res = await fetch('http://192.168.10.76:8080/api/auth/check', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });



  if (!res.ok) {
    return new Response(null, { status: 401 });
  }

  const rol = cookieStore.get('rol')?.value || '';

  return new Response(JSON.stringify({ ok: true, rol }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
