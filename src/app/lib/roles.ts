// ═══════════════════════════════════════════════════════════
// ROLES Y PERMISOS CENTRALIZADOS
// ═══════════════════════════════════════════════════════════

export const ROLES = {
  ADMIN: "ADMINISTRADOR",
  LIQUIDADOR: "LIQUIDADOR",
  CONTADOR: "CONTADOR",
  CLIENTE: "CLIENTE",
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

const ALL_ROLES: readonly string[] = Object.values(ROLES);

// ── Permisos por acción ──────────────────────────────────

/** Puede ver planillas, agentes, datos */
export function puedeVisualizar(rol: string): boolean {
  return ALL_ROLES.includes(rol);
}

/** Puede liquidar (buscar agentes, ver/editar planillas de liquidación) */
export function puedeLiquidar(rol: string): boolean {
  return ([ROLES.ADMIN, ROLES.LIQUIDADOR] as string[]).includes(rol);
}

/** Puede subir XML / importar PDFs */
export function puedeSubirArchivos(rol: string): boolean {
  return ([ROLES.ADMIN, ROLES.LIQUIDADOR] as string[]).includes(rol);
}

/** Puede descargar Excel/PDF */
export function puedeDescargar(rol: string): boolean {
  return ALL_ROLES.includes(rol);
}

/** Puede administrar usuarios */
export function puedeAdministrarUsuarios(rol: string): boolean {
  return rol === ROLES.ADMIN;
}
