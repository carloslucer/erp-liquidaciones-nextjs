// app/api/planilla/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const documento = searchParams.get("documento");
  const periodo = searchParams.get("periodo");

  if (!documento || !periodo) {
    return NextResponse.json(
      { error: "Faltan parametros: documento y/o periodo" },
      { status: 400 }
    );
  }

  const token = (await cookies()).get("token")?.value; // <- cambiá "token" si tu cookie se llama distinto
  if (!token) {
    return NextResponse.json({ error: "No hay JWT" }, { status: 401 });
  }

  const backendBase = process.env.API_BASE_URL;
  // ej: https://tu-backend.com  → definir en .env como API_BASE_URL
  if (!backendBase) {
    return NextResponse.json(
      { error: "Falta API_BASE_URL" },
      { status: 500 }
    );
  }

  const url = `${backendBase}/api/planilla?documento=${encodeURIComponent(
    documento
  )}&periodo=${encodeURIComponent(periodo)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

 // Intentamos leer JSON siempre
  const data = await res.json().catch(async () => {
    // fallback si el backend devuelve texto
    const json = await res.text().catch(() => "");
    return { error: "Respuesta no JSON del backend", detail: json };
  });

  // Devolvemos EXACTO el status del backend y el JSON (sin “Backend 404”)
  return NextResponse.json(data, { status: res.status });
}

