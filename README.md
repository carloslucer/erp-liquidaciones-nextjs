# ERP Liquidaciones — Next.js

Sistema ERP de gestión y liquidación de ganancias desarrollado con **Next.js 15** y **React 19**. Interfaz corporativa con autenticación JWT, control de acceso basado en roles y arquitectura BFF (Backend For Frontend).

> **Autor:** Carlos Lucero

---

## Descripción

Aplicación web para la gestión de declaraciones de ganancias, liquidación de agentes y administración de usuarios. Diseñada con estética de sistema contable/ERP moderno: limpia, ordenada y enfocada en la eficiencia operativa.

El frontend actúa como BFF: todas las llamadas al backend se realizan a través de los API Routes de Next.js, evitando exponer el backend directamente al cliente y protegiendo los tokens JWT con cookies `httpOnly`.

---

## Características principales

- **Autenticación segura** — Login con JWT almacenado en cookie `httpOnly`, sin exposición al cliente
- **Control de acceso por roles** — Rutas y acciones protegidas según el rol del usuario (`RoleGuard`)
- **Gestión de agentes** — Búsqueda y consulta de agentes por ID y período
- **Declaraciones** — Importación de archivos XML y PDF; historial de declaraciones; procesamiento por período
- **Planilla de liquidación** — Visualización y exportación a Excel de planillas de liquidación
- **Administración de usuarios** — Registro, activación, desactivación, cambio de clave y asignación de roles
- **UX con skeleton loaders y feedback visual** — Indicadores de carga, animaciones de transición y estados vacíos
- **Tests unitarios** — Cobertura con Vitest y Testing Library
- **Dockerizado** — Build multi-stage listo para producción

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS v4, CoreUI React |
| Íconos | Lucide React, React Icons, Heroicons |
| Animaciones | Framer Motion |
| Notificaciones | Sonner |
| Autenticación | JWT (httpOnly cookie) |
| Testing | Vitest, Testing Library |
| Contenedores | Docker, docker-compose |
| Lenguaje | TypeScript + JavaScript |

---

## Roles del sistema

| Rol | Permisos |
|---|---|
| `ADMINISTRADOR` | Acceso completo: usuarios, liquidación, declaraciones, agentes |
| `LIQUIDADOR` | Liquidación, importar archivos, consulta de agentes |
| `CONTADOR` | Visualización de planillas y agentes |
| `CLIENTE` | Consulta de datos propios |

---

## Requisitos previos

- Node.js 20+
- npm 10+
- Backend API corriendo (ver `.env.example`)

---

## Instalación y uso local

```bash
# 1. Clonar el repositorio
git clone https://github.com/carloslucero/erp-liquidaciones-nextjs.git
cd erp-liquidaciones-nextjs

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# 3. Instalar dependencias
npm install

# 4. Iniciar en modo desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Variables de entorno

Copiar `.env.example` como `.env` y completar:

```env
API_BASE_URL=http://localhost:8080   # URL del backend
COOKIE_SECURE=false                  # true en producción (HTTPS)
```

---

## Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo (Turbopack)
npm run build        # Build de producción
npm run start        # Iniciar build de producción
npm run test         # Ejecutar tests con Vitest
npm run test:watch   # Tests en modo watch
npm run test:coverage # Reporte de cobertura
npm run lint         # Análisis estático ESLint
```

---

## Docker

```bash
# Levantar con docker-compose
docker-compose up -d

# O build manual
docker build -t erp-liquidaciones-nextjs .
docker run -p 3000:3000 --env-file .env erp-liquidaciones-nextjs
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/              # API Routes (BFF — proxy al backend)
│   │   ├── login/
│   │   ├── logout/
│   │   ├── check/
│   │   ├── agentes/
│   │   ├── declaraciones/
│   │   ├── planilla/
│   │   └── auth/usuarios/
│   ├── components/       # Componentes reutilizables
│   ├── contexts/         # SessionContext, PlanillaSelectionContext
│   ├── dashboard/        # Páginas del dashboard (App Router)
│   │   ├── agentes/
│   │   ├── declaracion/
│   │   ├── planilla/
│   │   └── usuarios/
│   ├── lib/              # Lógica de roles y permisos
│   └── login/
└── tests/                # Tests unitarios (Vitest)
```

---

## Seguridad

- Token JWT nunca expuesto al cliente (cookie `httpOnly`)
- Todas las llamadas al backend pasan por los API Routes del servidor
- Protección de rutas con `RoleGuard` en cada página sensible
- Variables de entorno nunca commiteadas (`.gitignore` incluye `.env` y variantes)

---

## Licencia

MIT — © 2026 Carlos Lucero
