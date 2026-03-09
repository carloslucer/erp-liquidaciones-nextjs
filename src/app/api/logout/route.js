import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada' });
  const isProduction = process.env.NODE_ENV === 'production';

  const serializedToken = serialize('token', '', {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 0,
  });

  const serializedRol = serialize('rol', '', {
    path: '/',
    httpOnly: false,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 0,
  });

  response.headers.append('Set-Cookie', serializedToken);
  response.headers.append('Set-Cookie', serializedRol);

  return response;
}

