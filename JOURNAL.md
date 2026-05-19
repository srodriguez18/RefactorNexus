# Journal — Legacy Nexus Refactor

## 2026-05-19 — Inicio del proyecto

- Se recibe el legacy: monolito Python/Flask + JS vanilla + SQLite
- Se analiza el stack actual y se identifican problemas principales
- Hallazgos críticos: contraseñas en texto plano, auth bypass por
  flag en el body del request, 13+ puntos de SQL injection,
  lógica de descuentos duplicada en 3 archivos, campos numéricos
  guardados como TEXT, estados inconsistentes en reembolsos
- Stack tecnológico elegido: Node.js + TypeScript + Fastify (backend),
  React + TypeScript + Vite (frontend), Prisma + SQLite (persistencia)
- Bounded contexts identificados: Autenticacion, Catalogo, Inventario,
  Ventas, Compras, Reembolsos, Notificaciones, Reportes
- Finanzas como shared kernel en packages/finanzas
- Alcance sprint 1: Autenticacion, Catalogo, Inventario, Ventas
- Módulos fuera de alcance sprint 1: Compras, Reembolsos,
  Notificaciones, Reportes
