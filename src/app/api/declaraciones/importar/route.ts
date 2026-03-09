import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Permitir hasta 5 minutos para uploads grandes
export const maxDuration = 300;

export async function POST(req: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No hay JWT" }, { status: 401 });
  }

  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!backendBase) {
    return NextResponse.json(
      { error: "Falta NEXT_PUBLIC_API_BASE_URL" },
      { status: 500 }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Se esperaba multipart/form-data" },
      { status: 400 }
    );
  }

  let bodyBuffer: ArrayBuffer;
  try {
    bodyBuffer = await req.arrayBuffer();
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el cuerpo del request" },
      { status: 400 }
    );
  }

  if (!bodyBuffer.byteLength) {
    return NextResponse.json(
      { error: "No se enviaron archivos" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${backendBase}/api/declaraciones/importar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": contentType,
        "Content-Length": String(bodyBuffer.byteLength),
      },
      body: bodyBuffer,
    });

    const rawText = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[importar] Backend respondió con no-JSON:", rawText);
      return NextResponse.json(
        { error: "Respuesta no JSON del backend", detail: rawText.slice(0, 500) },
        { status: res.status || 502 }
      );
    }

    if (!res.ok) {
      console.error("[importar] Backend error:", res.status, data);
      return NextResponse.json(data, { status: res.status });
    }

    if (!data.idProceso) {
      console.error("[importar] Backend OK pero sin idProceso:", data);
      return NextResponse.json(
        { error: "El backend no devolvió idProceso", detail: data },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: 202 });
  } catch (error) {
    console.error("[importar] Error de conexión:", error);
    return NextResponse.json(
      { error: "Error al conectar con el backend", detail: String(error) },
      { status: 502 }
    );
  }
}
