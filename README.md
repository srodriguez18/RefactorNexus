# Legacy Nexus — Refactor

## Descripción

Nexus es un ERP interno para PyMEs migrado desde un monolito
Python/Flask + JavaScript vanilla + SQLite a un monorepo TypeScript
fullstack. El sistema cubre los módulos de catálogo, inventario, ventas,
compras, reembolsos, notificaciones y reportes.

**Stack:**

| Capa | Tecnología |
|---|---|
| Backend | Fastify 5 + TypeScript |
| ORM | Prisma 6 |
| Base de datos | SQLite (migrable a PostgreSQL) |
| Frontend | React 18 + Vite + TanStack Query v5 |
| Gestión de paquetes | pnpm workspaces |

La arquitectura sigue Clean Architecture por bounded context: cada módulo
tiene capas `domain/`, `application/`, `infrastructure/` e `interface/`.
La lógica financiera compartida vive en `packages/finance` como shared
kernel para evitar la duplicación que existía en el legacy.

Las decisiones de diseño están documentadas en [`docs/adr/`](docs/adr/).

---

## Cómo arrancar en una máquina limpia

### Requisitos previos

- Node.js >= 20
- pnpm >= 9 — instalar con `npm i -g pnpm` si no está disponible

### 1. Instalar dependencias

```bash
pnpm install
```


### 2. Crear la base de datos y aplicar migraciones

```bash
pnpm --filter @legacy-nexus/api exec prisma migrate dev
```

### 3. Cargar los datos del legacy

Lee `seed_data.sql`, normaliza los datos (fechas, estados, contraseñas)
e inserta todo en la base de datos nueva:

```bash
pnpm --filter @legacy-nexus/api seed
```

### 4. Arrancar en desarrollo

En terminales separadas:

```bash
# Backend — http://localhost:3000
pnpm dev:api

# Frontend — http://localhost:5173
pnpm dev:web
```

### Verificar que todo funciona

```bash
curl http://localhost:3000/health
# → {"status":"ok"}
```

---

## Estructura del monorepo

```
RefactorNexus/
├── apps/
│   ├── api/                        Backend Fastify
│   │   ├── prisma/
│   │   │   ├── schema.prisma       Esquema de base de datos
│   │   │   ├── migrations/         Migraciones generadas por Prisma
│   │   │   └── seed.ts             Script de migración desde seed_data.sql
│   │   └── src/
│   │       ├── index.ts            Entry point — registra routers y error handler
│   │       ├── lib/
│   │       │   ├── prisma.ts       Singleton de PrismaClient
│   │       │   └── AppError.ts     Error tipado con statusCode HTTP
│   │       └── modules/
│   │           ├── auth/           JWT login, middleware verifyToken/verifyAdmin
│   │           ├── catalog/        Productos — CRUD con soft delete
│   │           ├── inventory/      Stock por almacén, ajuste con validación de dominio
│   │           ├── sales/          Creación de ventas y devoluciones
│   │           ├── purchases/      Órdenes de compra y conciliación bancaria
│   │           ├── refunds/        Reembolsos — flujo pending → approved/rejected
│   │           ├── notifications/  Notificaciones por usuario y broadcast
│   │           ├── reports/        Reporte mensual y exportación CSV
│   │           └── exports/        Análisis dimensional (pivot) y totales agregados
│   │
│   └── web/                        Frontend React + Vite
│       └── src/
│           ├── main.tsx            Entry point
│           ├── index.css           Estilos globales y design tokens CSS
│           ├── App.tsx             Router principal y nav
│           ├── context/
│           │   └── AuthContext.tsx Token JWT en localStorage
│           ├── lib/
│           │   └── httpClient.ts   Wrapper fetch con auth header e interceptor 401
│           └── modules/            Un directorio por bounded context
│               ├── auth/
│               ├── catalog/
│               ├── inventory/
│               ├── sales/
│               ├── purchases/
│               ├── refunds/
│               ├── notifications/
│               └── reports/
│
├── packages/
│   ├── finance/                    Shared kernel — lógica de descuentos y VAT
│   │   └── src/index.ts            applyVAT(), calculateSaleTotal()
│   └── shared/                     Tipos y DTOs compartidos entre api y web
│       └── src/index.ts
│
├── docs/
│   └── adr/                        Architecture Decision Records
│       ├── ADR-001.md              Elección de arquitectura
│       ├── ADR-002.md              Stack tecnológico
│       ├── ADR-003.md              Estrategia de migración de datos
│       └── ADR-004.md              Estrategia de seguridad
│
├── seed_data.sql                   Datos del legacy (inmutable)
├── package.json                    Scripts raíz del monorepo
├── tsconfig.base.json              Configuración TypeScript base
└── pnpm-workspace.yaml             Definición de workspaces
```

### Estructura interna de cada módulo (backend)

Todos los módulos del backend siguen la misma estructura de cuatro capas:

```
modules/<nombre>/
├── domain/          Entidades, interfaces de repositorio — sin dependencias externas
├── application/     Casos de uso — orquestan dominio e inyectan repositorios
├── infrastructure/  Implementaciones de repositorio con Prisma
└── interface/       Router de Fastify — parsea HTTP y delega a casos de uso
```

### Endpoints disponibles

| Prefijo | Módulo |
|---|---|
| `POST /api/auth/login` | Autenticación |
| `/api/catalog` | Catálogo de productos |
| `/api/inventory` | Stock e inventario |
| `/api/sales` | Ventas |
| `/api/purchases` | Compras |
| `/api/refunds` | Reembolsos |
| `/api/notifications` | Notificaciones |
| `/api/reports` | Reportes mensuales, pivot y exportación CSV |
| `GET /health` | Health check |
