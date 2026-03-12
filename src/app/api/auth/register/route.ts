import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const VALID_ROLES = ["ADMINISTRADOR", "LIQUIDADOR", "CONTADOR"] as const;

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  // Todos los campos vienen en el body JSON
  let usuario: string | undefined;
  let clave: string | undefined;
  let nombre: string | undefined;
  let rol: string | undefined;
  try {
    const body = await req.json();
    usuario = typeof body?.usuario === "string" ? body.usuario.trim() : undefined;
    clave   = typeof body?.clave   === "string" ? body.clave.trim()   : undefined;
    nombre  = typeof body?.nombre  === "string" ? body.nombre.trim()  : undefined;
    rol     = typeof body?.rol     === "string" ? body.rol.trim().toUpperCase() : undefined;
  } catch {
    return NextResponse.json({ message: "Body JSON inválido" }, { status: 400 });
  }

  if (!usuario || !clave || !nombre || !rol) {
    return NextResponse.json(
      { message: "Los campos 'usuario', 'clave', 'nombre' y 'rol' son obligatorios" },
      { status: 400 }
    );
  }

  if (!VALID_ROLES.includes(rol as (typeof VALID_ROLES)[number])) {
    return NextResponse.json(
      { message: `Rol inválido. Valores válidos: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  const backendBase = process.env.API_BASE_URL;

  try {
   
    const backendRes = await fetch(
      `${backendBase}/api/auth/register`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, clave, nombre, rol }),
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
      (data as object) ?? { message: `Usuario registrado con rol ${rol}` },
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
