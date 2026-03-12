import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ message: 'Sesión cerrada' });
  const secureCookie = process.env.COOKIE_SECURE === 'true';

  const serializedToken = serialize('token', '', {
    path: '/',
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'strict',
    maxAge: 0,
  });

  const serializedRol = serialize('rol', '', {
    path: '/',
    httpOnly: false,
    secure: secureCookie,
    sameSite: 'strict',
    maxAge: 0,
  });

  response.headers.append('Set-Cookie', serializedToken);
  response.headers.append('Set-Cookie', serializedRol);

  return response;
}
