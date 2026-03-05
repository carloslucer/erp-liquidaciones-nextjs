import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const VALID_ROLES = ["ADMINISTRADOR", "LIQUIDADOR", "CONTADOR"] as const;

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ usuario: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { usuario } = await params;
  const url = new URL(req.url);
  const rol = url.searchParams.get("rol")?.trim().toUpperCase();

  if (!rol) {
    return NextResponse.json(
      { message: "El parámetro 'rol' es obligatorio" },
      { status: 400 }
    );
  }

  if (!VALID_ROLES.includes(rol as (typeof VALID_ROLES)[number])) {
    return NextResponse.json(
      { message: `Rol inválido. Valores válidos: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    const backendRes = await fetch(
      `${backendBase}/api/auth/usuarios/${encodeURIComponent(usuario)}/rol?rol=${encodeURIComponent(rol)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const text = await backendRes.text().catch(() => "");
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = null; }

    if (!backendRes.ok) {
      return NextResponse.json(
        (data as object) ?? { message: text || `Error ${backendRes.status}` },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(
      (data as object) ?? { message: `Rol actualizado a ${rol}` },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error de red";
    return NextResponse.json(
      { message: "No se pudo conectar con el servidor", detail: message },
      { status: 502 }
    );
  }
}
