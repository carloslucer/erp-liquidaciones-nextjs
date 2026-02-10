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
      console.log("entre en el lugar correcto")
      return NextResponse.json({ message: data.message || 'Credenciales inválidas' }, { status: 401 })
    }

    // ✅ Crear una respuesta
    const res = NextResponse.json({ ok: true })

    // ✅ Usar la API de cookies de NextResponse
    res.cookies.set('token', data.token, {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 20, // 20 minutos
    })

    return res

  } catch (error) {
    console.error("Error en login:", error.message)
    return NextResponse.json({ message: "Servicio no Disponible" }, { status: 403 })
  }
}
