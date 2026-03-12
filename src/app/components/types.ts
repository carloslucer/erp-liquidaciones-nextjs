"use client";

import type { Dispatch, SetStateAction } from "react";

// ─── Agente ──────────────────────────────────────────────────────────────────

export type Agente = {
  documento: string;
  nya: string;
  empresa: string;
  excep: string | null;
  fechaWeb: string | null;
  periodo: string;
  nroPres: string | null;
  cuil: string | null;
  cuitAgentRent: string;
  descripAgentRent: string;
};

// ─── Footer ──────────────────────────────────────────────────────────────────

export type FooterProps = {
  dark?: boolean;
  transparent?: boolean;
};

// ─── CreateButton ─────────────────────────────────────────────────────────────

export type CreateButtonProps = {
  onClick: () => void;
  nombre: string;
  color?: string;
};

// ─── CreateModal ─────────────────────────────────────────────────────────────

export type ProductoForm = {
  nombre: string;
  cantidad: number | string;
  precio: number | string;
};

export type CreateModalProps = {
  onCreate: (data: ProductoForm) => void;
};

// ─── MenuData ────────────────────────────────────────────────────────────────

export type MenuItemData = {
  label: string;
  icon: string;
  href: string;
};

export type MenuGroup = {
  title: string;
  roles: string[];
  items: MenuItemData[];
};

// ─── MenuContent ─────────────────────────────────────────────────────────────

export type MenuContentProps = {
  collapsed: boolean;
  declaracionOpen: boolean;
  setDeclaracionOpen: Dispatch<SetStateAction<boolean>>;
  declaracion572Open: boolean;
  setDeclaracion572Open: Dispatch<SetStateAction<boolean>>;
  usuariosOpen: boolean;
  setUsuariosOpen: Dispatch<SetStateAction<boolean>>;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void;
  rol: string | null;
};

// ─── PlanillaLiquidacion ─────────────────────────────────────────────────────

export type MonthKey =
  | "enero"
  | "febrero"
  | "marzo"
  | "abril"
  | "mayo"
  | "junio"
  | "julio"
  | "agosto"
  | "septiembre"
  | "octubre"
  | "noviembre"
  | "diciembre";

export type PlanillaRowInput = {
  descripcion: string;
  titulo: string;
  meses: Partial<Record<MonthKey, number | string | null>>;
};

export type PlanillaLiquidacionProps = {
  titulo?: string;
  periodo?: string;
  agente?: string;
  rows?: PlanillaRowInput[];
  monthOrder?: MonthKey[];
  monthLabels?: Partial<Record<MonthKey, string>>;
};
