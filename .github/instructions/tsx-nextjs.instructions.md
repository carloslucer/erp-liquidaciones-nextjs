---
applyTo: "**/*.tsx,**/*.ts,src/app/**/*.js,src/app/**/*.jsx"
---

# TSX + Next.js — Buenas Prácticas del Proyecto

Estilo corporativo ERP / Tango Gestión  
Versión: 1.0

---

## 1. COMPONENTES TSX

### Tipado estricto — siempre

```tsx
// ✅ Correcto
type Props = {
  agente: Agente;
  onSelect: (id: number) => void;
  disabled?: boolean;
};

export default function AgenteCard({ agente, onSelect, disabled = false }: Props) { ... }

// ❌ Evitar
export default function AgenteCard(props: any) { ... }
```

### Un componente = un archivo

- Un componente por archivo, nombre en **PascalCase**.
- El archivo lleva el mismo nombre: `BuscarAgente.tsx`.
- Props locales definidas en el mismo archivo; tipos compartidos en `src/app/components/types.ts`.

### Exports

- **Default export** para el componente principal del archivo.
- **Named exports** para helpers o sub-componentes secundarios dentro del mismo archivo.

---

## 2. ESTRUCTURA DE ARCHIVOS

```
src/
  app/
    components/      ← componentes reutilizables (TSX)
    contexts/        ← React contexts (TSX)
    dashboard/       ← rutas Next.js App Router (page.js / layout.jsx)
    api/             ← Route Handlers (route.ts)
    lib/             ← utilidades puras (ts)
```

- Los **page.js / layout.jsx** del dashboard van en `app/dashboard/`.
- Los **Route Handlers** van exclusivamente en `app/api/`.
- Nunca mezclar lógica de negocio dentro de un componente de página; extraerla a `lib/`.

---

## 3. NEXT.JS APP ROUTER

### Server vs Client Components

```tsx
// Client Component — requiere interacción o estado
"use client";
import { useState } from "react";

// Server Component — default en App Router, sin directiva
// No usar useState / useEffect / event handlers
```

**Regla:** ser Client Component solo cuando sea estrictamente necesario (formularios, hooks, eventos). Todo lo demás es Server Component por defecto.

### Route Handlers (`app/api/`)

```ts
// ✅ Correcto — siempre tipar Request y Response
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // lógica
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
```

- Siempre envolver en `try/catch`.
- Devolver status codes correctos (200, 201, 400, 401, 403, 404, 500).
- No exponer detalles internos del error al cliente.

### Metadata

```tsx
// En cada page o layout de App Router
export const metadata = {
  title: "Liquidaciones | ERP",
  description: "...",
};
```

---

## 4. HOOKS Y STATE

```tsx
// ✅ Estado local simple
const [loading, setLoading] = useState(false);

// ✅ Estado de formulario — usar objetos, no variables sueltas
const [form, setForm] = useState({ usuario: "", clave: "" });

// ❌ Evitar useEffect para fetching en Client Components — preferir Server Components o React Query
```

- `useEffect` solo para efectos secundarios reales (suscripciones, timers).
- Fetching de datos: preferir Server Components. Si el fetch requiere interacción del cliente, usar SWR o fetch con `cache`.

---

## 5. CONTEXTS

```tsx
// ✅ Patrón estándar del proyecto
"use client";

type SessionContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
};

export const SessionContext = createContext<SessionContextType | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider");
  return ctx;
}
```

- Siempre exportar un hook tipado (`useSession`, `usePlanillaSelection`).
- El context nunca tiene valor `null` en runtime — el hook lanza error si se usa fuera del provider.

---

## 6. ESTILO — CONSISTENCIA CON `agents.md`

### Paleta obligatoria

| Uso | Valor |
|-----|-------|
| Fondo página | `#F5F7FA` |
| Cards | `#FFFFFF` |
| Bordes | `#D0D7E2` |
| Texto principal | `#1F2933` |
| Texto secundario | `#6B7280` |
| Primario (azul) | `#2563EB` |
| Éxito | `#16A34A` |
| Error | `#DC2626` |

### Tailwind en TSX

```tsx
// ✅ Clases semánticas y ordenadas: layout → spacing → visual → estado
<button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
  Guardar
</button>
```

- No mezclar estilos inline con Tailwind.
- Usar `cn()` o `clsx()` cuando haya clases condicionales.

---

## 7. MANEJO DE ERRORES Y LOADING

```tsx
// ✅ Patrón estándar en componentes con fetch
if (loading) return <SkeletonLoader rows={8} />;
if (error)   return <ErrorMessage message={error} />;
if (!data)   return <EmptyState />;

return <ResultadosTable data={data} />;
```

- Siempre manejar los tres estados: loading, error, vacío.
- Usar skeleton loaders (ver `agents.md §15`) en lugar de spinners genéricos cuando haya tabla.

---

## 8. SEGURIDAD

- **Nunca** exponer tokens, secrets ni variables de entorno privadas en Client Components.
- Variables públicas: solo `NEXT_PUBLIC_*`.
- Validar siempre la sesión en Route Handlers antes de devolver datos.
- Sanitizar inputs antes de enviarlos a la base de datos.
- Usar `RoleGuard.tsx` para proteger rutas que requieren permisos específicos.

---

## 9. TESTING (Vitest)

```tsx
// Naming: <Componente>.test.tsx
// Usar @testing-library/react

import { render, screen } from "@testing-library/react";
import BuscarAgente from "../components/BuscarAgente";

describe("BuscarAgente", () => {
  it("muestra el input de búsqueda", () => {
    render(<BuscarAgente onSelect={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
```

- Tests en `src/tests/`.
- Un archivo de test por componente/módulo.
- Probar comportamiento visible (lo que el usuario ve), no implementación interna.

---

## 10. CHECKLIST ANTES DE COMMIT

- [ ] Props tipadas (sin `any`)
- [ ] `"use client"` solo donde es necesario
- [ ] Estados de loading / error / vacío implementados
- [ ] Route Handlers con `try/catch` y status codes correctos
- [ ] Sin secrets expuestos en cliente
- [ ] Test básico del componente nuevo
- [ ] Clases Tailwind consistentes con la paleta de `agents.md`
