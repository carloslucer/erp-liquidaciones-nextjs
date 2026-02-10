import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documento = searchParams.get("documento");
  const periodo = searchParams.get("periodo");

  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!documento || !periodo) {
    return NextResponse.json(
      { error: "Faltan parámetros documento o periodo" },
      { status: 400 }
    );
  }

  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No hay JWT" }, { status: 401 });
  }

  try {
    const url = `${backendBase}/api/planilla/excel?documento=${encodeURIComponent(
      documento
    )}&periodo=${encodeURIComponent(periodo)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al obtener el archivo del servidor" },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="Planilla_${documento}_${periodo}.xlsx"`
    );

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Excel proxy error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
