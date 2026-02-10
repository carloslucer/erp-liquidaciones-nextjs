import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const backendBase =  process.env.NEXT_PUBLIC_API_BASE_URL;


  if (!q) {
    return NextResponse.json(
      {
        error: "Parámetro inválido",
        detail: "Debe indicar un documento o nombre (q)",
      },
      { status: 400 }
    );
  }

  // Forward al backend Spring
  const backendRes = await fetch(
    `${backendBase}/api/agentes/search?q=${encodeURIComponent(q)}`,
    {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  const data = await backendRes.json().catch(() => null);

  return NextResponse.json(data, { status: backendRes.status });
}
