import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

  const formData = await req.formData();
  const archivos = formData.getAll("archivos");

  if (!archivos || archivos.length === 0) {
    return NextResponse.json(
      { error: "No se enviaron archivos" },
      { status: 400 }
    );
  }

  // Re-build FormData for the backend
  const backendForm = new FormData();
  for (const archivo of archivos) {
    backendForm.append("archivos", archivo);
  }

  try {
    const res = await fetch(`${backendBase}/api/declaraciones/importar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendForm,
    });

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
