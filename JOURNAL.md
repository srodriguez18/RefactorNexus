# Journal — Legacy Nexus Refactor

## 2026-05-19 14:00 — Inicio del proyecto

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

## 2026-05-19 18:30 — Migración de datos del legacy

- Se identificó que faltaba el script de migración de datos
- Se analizó seed_data.sql y se encontraron los siguientes
  problemas de calidad en los datos del legacy:
  - Fechas en 4 formatos distintos: ISO, DD/MM/YYYY, Unix timestamp
  - Status de refunds en 6 variantes inconsistentes:
    'pending', 'Approved', 'aprobada', 'done', 'rejected'
  - Status de notifications en 4 variantes inconsistentes:
    'unread', 'read', 'READ', 'leido'
  - Passwords en texto plano → hasheados con bcrypt en la migración
  - Campos amount en refunds y total en sales guardados como TEXT
    → convertidos a Decimal en el nuevo schema
- Se creó apps/api/prisma/seed.ts con normalización completa
- El archivo seed_data.sql no fue modificado (restricción del examen)
- La migración se ejecutó exitosamente con todos los registros
  correctamente normalizados y verificados en Prisma Studio
