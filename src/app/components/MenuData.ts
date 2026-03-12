import type { MenuGroup } from "./types";

const menuData: MenuGroup[] = [
  {
    title: "Gestión de Usuarios",
    roles: ["admin"],
    items: [
      { label: "Usuarios", icon: "👤", href: "/usuarios" },
      { label: "Roles", icon: "🔐", href: "/roles" },
    ],
  },
  {
    title: "Gestión de Reportes",
    roles: ["admin", "usuario"],
    items: [
      { label: "Reporte General", icon: "📊", href: "/reportes/general" },
      { label: "Reporte Detallado", icon: "📄", href: "/reportes/detalle" },
    ],
  },
];

export default menuData;
