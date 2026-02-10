import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
 
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const backendBase =  process.env.NEXT_PUBLIC_API_BASE_URL;

 const r = await fetch(`${backendBase}/api/auth/check`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!r.ok) {
    const res = NextResponse.json({ ok: false }, { status: 401 })
    // opcional: limpiar cookie si expiró o es inválido
    res.cookies.set('token', '', { path: '/', maxAge: 0 })
    return res
  }

  const data = await r.json().catch(() => ({}))
  return NextResponse.json({ ok: true, ...data }, { status: 200 })
}
