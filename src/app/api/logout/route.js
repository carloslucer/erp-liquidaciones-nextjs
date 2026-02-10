import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada' });

  const serialized = serialize('token', '', {
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 0,
  });

  response.headers.set('Set-Cookie', serialized);

  return response;
}

