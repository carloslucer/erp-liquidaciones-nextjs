"use client";

import { useState } from "react";
import RoleGuard from "@/app/components/RoleGuard";
import {
  PageShell,
  SectionHeader,
  ActionButtonPrimary,
} from "@/app/components/CorporateUI";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ROLES_VALIDOS = ["ADMINISTRADOR", "LIQUIDADOR", "CONTADOR"] as const;

type ApiResult = { ok: boolean; status: number; data: any };

async function apiCall(url: string, options: RequestInit = {}): Promise<ApiResult> {
  const res = await fetch(url, { credentials: "include", ...options });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

function RegistrarContent() {
  const [usuario, setUsuario]             = useState<string>("");
  const [nombre, setNombre]               = useState<string>("");
  const [clave, setClave]                 = useState<string>("");
  const [confirmar, setConfirmar]         = useState<string>("");
  const [rol, setRol]                     = useState<string>("LIQUIDADOR");
  const [showClave, setShowClave]         = useState<boolean>(false);
  const [showConfirmar, setShowConfirmar] = useState<boolean>(false);
  const [regLoading, setRegLoading]       = useState<boolean>(false);
  const [regError, setRegError]           = useState<string>("");
  const [regOk, setRegOk]                 = useState<string>("");

  const claveOk    = clave.length >= 6;
  const claveMatch = clave === confirmar && confirmar !== "";
  const formValido = usuario.trim() && nombre.trim() && claveOk && claveMatch;

  function clearFeedback() { setRegError(""); setRegOk(""); }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegError(""); setRegOk("");
    if (!usuario.trim()) { setRegError("El nombre de usuario es obligatorio."); return; }
    if (!nombre.trim())  { setRegError("El nombre completo es obligatorio."); return; }
    if (!claveOk)        { setRegError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (!claveMatch)     { setRegError("Las contraseñas no coinciden."); return; }

    setRegLoading(true);
    const { ok, data } = await apiCall("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: usuario.trim(), nombre: nombre.trim(), clave, rol }),
    });
    setRegLoading(false);

    if (ok) {
      setRegOk(data?.message || `Usuario registrado con rol ${rol}.`);
      setUsuario(""); setNombre(""); setClave(""); setConfirmar(""); setRol("LIQUIDADOR");
    } else {
      setRegError(data?.message || "No se pudo registrar el usuario.");
    }
  }

  return (
    <div className="flex justify-center items-start px-6 py-6">
      <div className="w-full max-w-2xl">
        <PageShell>
          <SectionHeader
            title="Registrar nuevo usuario"
            subtitle="Complete los datos para crear una nueva cuenta de acceso al sistema."
          />

          <div className="bg-white border border-[#D0D7E2] rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.05)] px-6 py-6">
            <form onSubmit={handleRegister} className="flex flex-col gap-5">

              {/* Usuario (login) */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">
                  Usuario
                </label>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => { setUsuario(e.target.value); clearFeedback(); }}
                  placeholder="ej: jperez"
                  disabled={regLoading}
                  autoComplete="username"
                  className="h-[40px] border border-[#D0D7E2] rounded-[4px] px-3 text-[13px] text-[#1F2933] bg-white placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 disabled:opacity-60"
                />
                <span className="text-[11px] text-[#6B7280]">Nombre de acceso para iniciar sesión.</span>
              </div>

              {/* Nombre completo */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => { setNombre(e.target.value); clearFeedback(); }}
                  placeholder="ej: Juan Pérez"
                  disabled={regLoading}
                  autoComplete="name"
                  className="h-[40px] border border-[#D0D7E2] rounded-[4px] px-3 text-[13px] text-[#1F2933] bg-white placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 disabled:opacity-60"
                />
                <span className="text-[11px] text-[#6B7280]">Nombre y apellido del usuario.</span>
              </div>

              {/* Contraseña */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showClave ? "text" : "password"}
                    value={clave}
                    onChange={(e) => { setClave(e.target.value); clearFeedback(); }}
                    placeholder="Mínimo 6 caracteres"
                    disabled={regLoading}
                    autoComplete="new-password"
                    className={`h-[40px] w-full border rounded-[4px] px-3 pr-10 text-[13px] text-[#1F2933] bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 disabled:opacity-60 transition-colors ${
                      clave === "" ? "border-[#D0D7E2] focus:border-[#2563EB] focus:ring-[#2563EB]/15"
                      : claveOk   ? "border-[#16A34A] focus:border-[#16A34A] focus:ring-[#16A34A]/15"
                                  : "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/15"
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowClave(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2933] transition-colors"
                  >
                    {showClave ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {clave !== "" && !claveOk && (
                  <span className="text-[11px] text-[#DC2626]">Mínimo 6 caracteres.</span>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmar ? "text" : "password"}
                    value={confirmar}
                    onChange={(e) => { setConfirmar(e.target.value); clearFeedback(); }}
                    placeholder="Repetí la contraseña"
                    disabled={regLoading}
                    autoComplete="new-password"
                    className={`h-[40px] w-full border rounded-[4px] px-3 pr-10 text-[13px] text-[#1F2933] bg-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 disabled:opacity-60 transition-colors ${
                      confirmar === "" ? "border-[#D0D7E2] focus:border-[#2563EB] focus:ring-[#2563EB]/15"
                      : claveMatch    ? "border-[#16A34A] focus:border-[#16A34A] focus:ring-[#16A34A]/15"
                                      : "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/15"
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmar(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2933] transition-colors"
                  >
                    {showConfirmar ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {confirmar !== "" && !claveMatch && (
                  <span className="text-[11px] text-[#DC2626]">Las contraseñas no coinciden.</span>
                )}
                {claveMatch && (
                  <span className="text-[11px] text-[#16A34A]">Las contraseñas coinciden.</span>
                )}
              </div>

              {/* Rol */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">
                  Rol
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  disabled={regLoading}
                  className="h-[40px] border border-[#D0D7E2] rounded-[4px] px-3 text-[13px] text-[#1F2933] bg-white focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 disabled:opacity-60"
                >
                  {ROLES_VALIDOS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <span className="text-[11px] text-[#6B7280]">Define los permisos y accesos del usuario dentro del sistema.</span>
              </div>

              {/* Feedback */}
              {regError && (
                <div className="text-[13px] text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/30 rounded-md px-3 py-2">
                  {regError}
                </div>
              )}
              {regOk && (
                <div className="text-[13px] text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/30 rounded-md px-3 py-2">
                  {regOk}
                </div>
              )}

              {/* Botón */}
              <div className="pt-1">
                <ActionButtonPrimary
                  type="submit"
                  disabled={regLoading || !formValido}
                  className="w-full !h-[42px] !text-[14px]"
                >
                  {regLoading ? "Registrando…" : "Registrar usuario"}
                </ActionButtonPrimary>
              </div>
            </form>
          </div>
        </PageShell>
      </div>
    </div>
  );
}

export default function RegistrarPage() {
  return (
    <RoleGuard allowedRoles={["ADMINISTRADOR"]}>
      <RegistrarContent />
    </RoleGuard>
  );
}
