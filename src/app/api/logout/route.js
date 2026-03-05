import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada' });

  const serializedToken = serialize('token', '', {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 0,
  });

  const serializedRol = serialize('rol', '', {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 0,
  });

  response.headers.append('Set-Cookie', serializedToken);
  response.headers.append('Set-Cookie', serializedRol);

  return response;
}

