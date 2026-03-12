import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ idProceso: string }> }
) {
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

  const { idProceso } = await params;
  if (!idProceso) {
    return NextResponse.json(
      { error: "Falta el id_proceso" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${backendBase}/api/declaraciones/proceso/${idProceso}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json().catch(async () => {
      const text = await res.text().catch(() => "");
      return { error: "Respuesta no JSON del backend", detail: text };
    });

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al conectar con el backend" },
      { status: 502 }
    );
  }
}
