import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { usuario, clave } = body
    const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    const response = await fetch(`${backendBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, clave })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || 'Credenciales inválidas' }, { status: 401 })
    }

    const TOKEN_MAX_AGE = 60 * 20; // 20 minutos
    const rol = data.rol || ''
    const res = NextResponse.json({ ok: true, rol })
    const secureCookie = process.env.COOKIE_SECURE === 'true';

    res.cookies.set('token', data.token, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_MAX_AGE,
    })

    res.cookies.set('rol', rol, {
      httpOnly: false,
      secure: secureCookie,
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_MAX_AGE,
    })

    return res

  } catch (error) {
    return NextResponse.json({ message: "Servicio no Disponible" }, { status: 403 })
  }
}
