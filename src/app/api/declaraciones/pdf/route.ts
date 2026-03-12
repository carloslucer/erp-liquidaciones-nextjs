import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cuit = searchParams.get("cuit");
  const periodo = searchParams.get("periodo");
  const nroPresentacion = searchParams.get("nroPresentacion");

  if (!cuit || !periodo || !nroPresentacion) {
    return NextResponse.json(
      { error: "Faltan parámetros: cuit, periodo y/o nroPresentacion" },
      { status: 400 }
    );
  }

  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No hay JWT" }, { status: 401 });
  }

  const backendBase = process.env.API_BASE_URL;
  if (!backendBase) {
    return NextResponse.json(
      { error: "Falta API_BASE_URL" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `${backendBase}/api/declaraciones/${encodeURIComponent(cuit)}/${encodeURIComponent(periodo)}/${encodeURIComponent(nroPresentacion)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "No se pudo obtener el PDF", detail: text },
        { status: res.status }
      );
    }

    const blob = await res.blob();

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${cuit}_${periodo}_${nroPresentacion}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error al conectar con el backend" },
      { status: 502 }
    );
  }
}
