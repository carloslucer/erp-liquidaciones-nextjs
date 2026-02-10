import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const documento = url.searchParams.get("documento")?.trim();
  const periodo = url.searchParams.get("periodo")?.trim();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const backendBase =  process.env.NEXT_PUBLIC_API_BASE_URL;


  if (!documento || !periodo) {
    return NextResponse.json(
      {
        error: "Parámetro inválido",
        detail: "Debe indicar un documento y periodo",
      },
      { status: 400 }
    );
  }

  // Forward al backend Spring
  const backendRes = await fetch(
    `${backendBase}/api/agentes?documento=${encodeURIComponent(documento)}&periodo=${encodeURIComponent(periodo)}`,
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
