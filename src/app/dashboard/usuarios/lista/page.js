"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import RoleGuard from "@/app/components/RoleGuard";
import {
  PageShell,
  SectionHeader,
  AlertBox,
  ActionButtonPrimary,
  ActionButtonSecondary,
} from "@/app/components/CorporateUI";

// --- constantes --------------------------------------------
const ROLES_VALIDOS = ["ADMINISTRADOR", "LIQUIDADOR", "CONTADOR"];

const ESTADO_BADGE = {
  true:  "bg-[#D1FAE5] text-[#15803D]",
  false: "bg-[#FEE2E2] text-[#DC2626]",
};

const ROL_BADGE = {
  ADMINISTRADOR: "bg-[#DBEAFE] text-[#1D4ED8]",
  LIQUIDADOR:    "bg-[#D1FAE5] text-[#15803D]",
  CONTADOR:      "bg-[#FEF3C7] text-[#B45309]",
};

// --- helpers -----------------------------------------------
async function apiCall(url, options = {}) {
  const res = await fetch(url, { credentials: "include", ...options });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

function esActivo(val) {
  return val === true || val === 1 || val === "S" || val === "1";
}

// Normaliza un usuario del backend a campos UPPERCASE
// Soporta: {usuario, nombre, rol, activo} y {USUARIO, NOMBRE, ROL, ACTIVO}
function normalizeUsuario(u) {
  return {
    USUARIO: u.USUARIO ?? u.usuario ?? u.Username ?? u.username ?? "",
    NOMBRE:  u.NOMBRE  ?? u.nombre  ?? u.Name     ?? u.name     ?? "",
    ROL:     u.ROL     ?? u.rol     ?? u.Role     ?? u.role     ?? "",
    ACTIVO:  u.ACTIVO  ?? u.activo  ?? u.Active   ?? u.active   ?? false,
  };
}

// --- Skeleton ----------------------------------------------
function SkeletonRows({ cols = 5, rows = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"}>
      {Array.from({ length: cols }).map((__, j) => (
        <td key={j} className="px-3 py-[10px]">
          <div className="skeleton h-4 rounded" style={{ width: j === 0 ? "55%" : "75%" }} />
        </td>
      ))}
    </tr>
  ));
}

// --- Modal Editar ------------------------------------------
function ModalEditar({ usuario, onClose, onSuccess }) {
  const activo0 = esActivo(usuario.ACTIVO);

  const [rol, setRol]             = useState(usuario.ROL ?? "");
  const [activo, setActivo]       = useState(activo0);
  const [clave, setClave]         = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showClave, setShowClave] = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState({});
  const [feedback, setFeedback]   = useState(null);

  const claveOk      = clave === "" || clave.length >= 6;
  const claveMatch   = clave === "" || (clave.length >= 6 && clave === confirmar);
  const cambiarClave = clave.trim() !== "";

  function validate() {
    const e = {};
    if (!rol) e.rol = "Selecciona un rol.";
    if (cambiarClave && clave.length < 6) e.clave = "Minimo 6 caracteres.";
    if (cambiarClave && clave !== confirmar) e.confirmar = "Las contrasenas no coinciden.";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);

    const u = encodeURIComponent(usuario.USUARIO);
    const errores = [];

    // 1. Rol
    if (rol !== usuario.ROL) {
      const r = await apiCall(
        `/api/auth/usuarios/${u}/rol?rol=${encodeURIComponent(rol)}`,
        { method: "PUT" }
      );
      if (!r.ok) errores.push(r.data?.message || "Error al cambiar rol.");
    }

    // 2. Estado
    if (activo !== activo0) {
      const accion = activo ? "activar" : "desactivar";
      const r = await apiCall(`/api/auth/usuarios/${u}/${accion}`, { method: "PUT" });
      if (!r.ok) errores.push(r.data?.message || `Error al ${accion}.`);
    }

    // 3. Contrasena
    if (cambiarClave) {
      const r = await apiCall(`/api/auth/usuarios/${u}/cambiar-clave`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clave }),
      });
      if (!r.ok) errores.push(r.data?.message || "Error al cambiar contrasena.");
    }

    setSaving(false);

    if (errores.length === 0) {
      setFeedback({ ok: true, msg: "Cambios guardados correctamente." });
      setTimeout(() => { onSuccess(); onClose(); }, 900);
    } else {
      setFeedback({ ok: false, msg: errores.join(" | ") });
    }
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4">
      <div className="bg-white border border-[#D0D7E2] rounded-lg shadow-2xl w-full max-w-md flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D0D7E2]">
          <div>
            <h3 className="text-[15px] font-semibold text-[#1F2933] border-l-4 border-[#2563EB] pl-2">
              Modificar usuario
            </h3>
            <p className="text-[12px] text-[#6B7280] mt-0.5 pl-3">
              <span className="font-mono font-semibold text-[#1F2933]">{usuario.USUARIO}</span>
              {usuario.NOMBRE ? ` - ${usuario.NOMBRE}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2933] transition-colors p-1">
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-5 overflow-y-auto max-h-[70vh]">

          {/* Rol */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">Rol</label>
            <select
              value={rol}
              onChange={(e) => { setRol(e.target.value); setErrors(p => ({ ...p, rol: undefined })); }}
              disabled={saving}
              className="h-[38px] border border-[#D0D7E2] rounded-[4px] px-3 text-[13px] bg-white text-[#1F2933] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15 disabled:opacity-60"
            >
              {ROLES_VALIDOS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.rol && <span className="text-[11px] text-[#DC2626]">{errors.rol}</span>}
          </div>

          {/* Estado toggle */}
          <div className="flex items-center justify-between bg-[#F9FAFB] border border-[#D0D7E2] rounded-md px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-[#1F2933]">Estado de la cuenta</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                {activo ? "El usuario puede iniciar sesion." : "El usuario tiene acceso bloqueado."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivo(v => !v)}
              disabled={saving}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                activo ? "bg-[#16A34A]" : "bg-[#D0D7E2]"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                activo ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>

          {/* Contrasena */}
          <div className="border-t border-[#D0D7E2] pt-4 flex flex-col gap-3">
            <p className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wide">
              Cambiar contrasena <span className="normal-case font-normal">(opcional)</span>
            </p>

            {/* Nueva clave */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-[#6B7280]">Nueva contrasena</label>
              <div className="relative">
                <input
                  type={showClave ? "text" : "password"}
                  value={clave}
                  onChange={(e) => { setClave(e.target.value); setErrors(p => ({ ...p, clave: undefined })); }}
                  placeholder="Minimo 6 caracteres"
                  disabled={saving}
                  autoComplete="new-password"
                  className={`h-[38px] w-full border rounded-[4px] px-3 pr-10 text-[13px] bg-white text-[#1F2933] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 disabled:opacity-60 transition-colors ${
                    errors.clave        ? "border-[#DC2626] focus:ring-[#DC2626]/15"
                    : clave && !claveOk ? "border-[#DC2626] focus:ring-[#DC2626]/15"
                    : clave && claveOk  ? "border-[#16A34A] focus:ring-[#16A34A]/15"
                    : "border-[#D0D7E2] focus:border-[#2563EB] focus:ring-[#2563EB]/15"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowClave(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2933]"
                >
                  {showClave ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {errors.clave && <span className="text-[11px] text-[#DC2626]">{errors.clave}</span>}
            </div>

            {/* Confirmar */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-[#6B7280]">Confirmar contrasena</label>
              <div className="relative">
                <input
                  type={showConf ? "text" : "password"}
                  value={confirmar}
                  onChange={(e) => { setConfirmar(e.target.value); setErrors(p => ({ ...p, confirmar: undefined })); }}
                  placeholder="Repite la contrasena"
                  disabled={saving || !clave}
                  autoComplete="new-password"
                  className={`h-[38px] w-full border rounded-[4px] px-3 pr-10 text-[13px] bg-white text-[#1F2933] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 disabled:opacity-60 transition-colors ${
                    errors.confirmar                   ? "border-[#DC2626] focus:ring-[#DC2626]/15"
                    : confirmar && clave !== confirmar ? "border-[#DC2626] focus:ring-[#DC2626]/15"
                    : confirmar && clave === confirmar ? "border-[#16A34A] focus:ring-[#16A34A]/15"
                    : "border-[#D0D7E2] focus:border-[#2563EB] focus:ring-[#2563EB]/15"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2933]"
                >
                  {showConf ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {errors.confirmar && (
                <span className="text-[11px] text-[#DC2626]">{errors.confirmar}</span>
              )}
              {!errors.confirmar && confirmar && clave === confirmar && (
                <span className="text-[11px] text-[#16A34A]">Las contrasenas coinciden.</span>
              )}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`text-[13px] px-3 py-2 rounded-md border ${
              feedback.ok
                ? "text-[#16A34A] bg-[#F0FDF4] border-[#16A34A]/30"
                : "text-[#DC2626] bg-[#FEF2F2] border-[#DC2626]/30"
            }`}>
              {feedback.msg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#D0D7E2]">
          <ActionButtonSecondary onClick={onClose} disabled={saving}>
            Cancelar
          </ActionButtonSecondary>
          <ActionButtonPrimary onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </ActionButtonPrimary>
        </div>
      </div>
    </div>
  );
}

// --- Fila tabla --------------------------------------------
function UsuarioRow({ u, onEditar }) {
  const activo = esActivo(u.ACTIVO);
  return (
    <tr className="hover:bg-[#F1F5F9] transition-colors duration-100 border-b border-[#D0D7E2]">
      <td className="px-3 py-[10px] font-mono text-[13px] text-[#1F2933] whitespace-nowrap">
        {u.USUARIO}
      </td>
      <td className="px-3 py-[10px] text-[13px] text-[#1F2933]">
        {u.NOMBRE ?? "-"}
      </td>
      <td className="px-3 py-[10px]">
        <span className={`inline-block px-2 py-[2px] rounded-full text-[11px] font-semibold ${ROL_BADGE[u.ROL] ?? "bg-[#F1F5F9] text-[#6B7280]"}`}>
          {u.ROL ?? "-"}
        </span>
      </td>
      <td className="px-3 py-[10px]">
        <span className={`inline-block px-2 py-[2px] rounded-full text-[11px] font-semibold ${ESTADO_BADGE[String(activo)]}`}>
          {activo ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="px-3 py-[10px]">
        <button
          onClick={() => onEditar(u)}
          className="h-[26px] px-3 text-[11px] font-semibold rounded-[4px] border border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] transition-all"
        >
          Modificar
        </button>
      </td>
    </tr>
  );
}

// --- Pagina principal --------------------------------------
function ListaContent() {
  const [usuarios, setUsuarios]       = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError]     = useState("");
  const [toast, setToast]             = useState(null);
  const [editando, setEditando]       = useState(null);
  const toastTimer                    = useRef(null);

  const cargarUsuarios = useCallback(async () => {
    setListLoading(true);
    setListError("");
    const { ok, data } = await apiCall("/api/auth/usuarios");
    if (ok) {
      const lista = Array.isArray(data) ? data : [];
      setUsuarios(lista.map(normalizeUsuario));
    } else {
      setListError(data?.message || "No se pudo cargar la lista de usuarios.");
    }
    setListLoading(false);
  }, []);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  function showToast(ok, msg) {
    setToast({ ok, msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  function handleSuccess() {
    showToast(true, "Usuario actualizado correctamente.");
    cargarUsuarios();
  }

  return (
    <div className="flex justify-center items-start px-6 py-6">
      <div className="w-full max-w-5xl">
        <PageShell>
          <SectionHeader
            title="Usuarios registrados"
            subtitle="Consulta y modifica los datos de cada cuenta."
            actions={
              <ActionButtonSecondary
                onClick={cargarUsuarios}
                disabled={listLoading}
                className="!h-[30px] !text-[12px]"
              >
                {listLoading ? "Actualizando..." : "Actualizar"}
              </ActionButtonSecondary>
            }
          />

          {/* Toast */}
          {toast && (
            <div className={`text-[12px] px-3 py-1.5 rounded-md border ${
              toast.ok
                ? "text-[#16A34A] bg-[#F0FDF4] border-[#16A34A]/30"
                : "text-[#DC2626] bg-[#FEF2F2] border-[#DC2626]/30"
            }`}>
              {toast.msg}
            </div>
          )}

          {listError && <AlertBox message={listError} />}

          {/* Tabla */}
          <div className="bg-white border border-[#D0D7E2] rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#E5EAF3] text-[#1F2933]">
                    {["Usuario", "Nombre", "Rol", "Estado", "Acciones"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-[9px] text-left text-[12px] font-semibold tracking-wide border-b border-[#D0D7E2]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <SkeletonRows cols={5} rows={6} />
                  ) : usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-[#6B7280] text-[13px]">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((u) => (
                      <UsuarioRow key={u.USUARIO} u={u} onEditar={setEditando} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!listLoading && usuarios.length > 0 && (
            <p className="text-[11px] text-[#6B7280] text-right">
              {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} en el sistema
            </p>
          )}
        </PageShell>
      </div>

      {/* Modal */}
      {editando && (
        <ModalEditar
          usuario={editando}
          onClose={() => setEditando(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

export default function ListaPage() {
  return (
    <RoleGuard allowedRoles={["ADMINISTRADOR"]}>
      <ListaContent />
    </RoleGuard>
  );
}
