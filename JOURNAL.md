# Journal — Legacy Nexus Refactor

---

## 2026-05-19 14:00 — Análisis del legacy e inicio del proyecto

**Explorado:**
Lectura completa del monolito Python/Flask. El archivo principal
de rutas (`app.py`) tenía ~800 líneas sin separación de capas: parsing
HTTP, validación, SQL directo, lógica de negocio y manejo de sesión
en el mismo bloque de código.

**Hallazgos críticos en el legacy:**
- Contraseñas en texto plano en la tabla `users`
- Auth bypass: `require_admin(data)` verificaba `data.get('is_admin')` —
  cualquier request con `{"is_admin": true}` en el body pasaba como admin
- 13+ puntos de SQL injection: `search_products`, `filter_by_warehouse`,
  `get_sales_by_user` (duplicado en dos archivos), `export_report`,
  `list_for_user`, `search_by_kind`, `latest_for_user`, `list_by_status`,
  `count_unread`, `search_refunds`, `list_refunds_by_user`, `download_csv`
- Lógica de descuentos (`calc_discount`) duplicada en `logic/finance.py`,
  `logic/reports.py` y `logic/exports.py`
- Campos numéricos guardados como TEXT: `amount` en refunds y `total` en sales
- Estados inconsistentes en refunds: `'pending'`, `'Approved'`, `'aprobada'`,
  `'done'`, `'rejected'` — 6 variantes para los mismos 3 estados
- Stock negativo posible: `decrement_stock` restaba sin validar
- Caché `_NOTIF_CACHE` con invalidación incorrecta en delete y create

**Decisiones tomadas:**
- Stack: Fastify 5 + Prisma 6 + SQLite + React 18 + Vite (TypeScript estricto)
- Arquitectura: Clean Architecture con módulos por bounded context
- Shared kernel: lógica financiera en `packages/finance` para eliminar
  la triplicación existente
- Bounded contexts identificados: Auth, Catálogo, Inventario, Ventas,
  Compras, Reembolsos, Notificaciones, Reportes
- Sprint 1: Auth, Catálogo, Inventario, Ventas

---

## 2026-05-19 14:30 — Setup del monorepo

**Implementado:**
- Estructura pnpm workspaces con `apps/api`, `apps/web`,
  `packages/finance`, `packages/shared`
- `tsconfig.base.json` con `strict: true` y `NodeNext` resolution
- `packages/finance/src/index.ts`: `applyVAT()` y `calculateSaleTotal()`
  con lógica de descuento por tipo de cliente (`NORMAL` / `LEGACY_A`)
- `packages/shared/src/index.ts`: DTOs e interfaces compartidas
  entre API y web

**Decisión:**
`packages/finance` exporta funciones puras sin estado — testeable
con Vitest sin levantar servidor ni base de datos.

---

## 2026-05-19 15:00 — Schema Prisma y módulos Sprint 1 (backend)

**Implementado:**
- `apps/api/prisma/schema.prisma`: modelos `User`, `Supplier`,
  `Warehouse`, `Product`, `InventoryStock`, `InventoryMovement`,
  `Sale`, `SaleItem`, `Purchase`, `PurchaseItem`, `Notification`, `Refund`
- Correcciones aplicadas en el schema respecto al legacy:
  - `amount` (Refund) y `total` (Sale): `TEXT` → `Decimal`
  - `discount`: columna nueva — el legacy lo calculaba como side-effect
    en un trigger SQL, sin columna explícita
  - FK enforcement activado (legacy tenía `PRAGMA foreign_keys = OFF`)
- Módulos Sprint 1 completos (4 capas cada uno):
  - `auth`: Login con bcrypt.compare, JWT firmado, verifyToken, verifyAdmin
  - `catalog`: ListProducts, GetProduct, SearchProducts, CreateProduct,
    DeleteProduct con soft delete
  - `inventory`: ListInventory, ListByWarehouse, GetStock, AdjustStock
    con validación `canDecrement()` en dominio
  - `sales`: CreateSale con cálculo de descuento vía `calculateSaleTotal`,
    ReturnSale con restitución de stock

**Hallazgo durante implementación:**
`calculateSaleTotal` en el legacy tomaba el precio del producto al
momento de la venta pero usaba el precio actual al calcular reportes.
En el sistema nuevo el `unitPrice` se guarda en `SaleItem` al momento
de la venta.

---

## 2026-05-19 18:30 — Script de migración de datos

**Explorado:**
`seed_data.sql` declarado inmutable por las reglas del proyecto.
Análisis de los datos: 4 formatos de fecha, 6 variantes de estado
en refunds, 4 variantes en notifications, contraseñas en texto plano,
campos numéricos como TEXT, registros con FK inválidas.

**Implementado:**
`apps/api/prisma/seed.ts` con:
- `parseDate()`: detecta y normaliza ISO, ISO con hora, `DD/MM/YYYY`
  y Unix timestamp en segundos
- `parseRefundStatus()`: normaliza las 6 variantes a
  `pending | approved | rejected` (`'done'` y `'aprobada'` → `approved`)
- `parseNotificationStatus()`: normaliza `'READ'` y `'leido'` → `read`
- `bcrypt.hash()` con 10 salt rounds para todas las contraseñas
- `parseFloat()` en campos TEXT numéricos
- Omisión con log de registros con FK inválidas
- Idempotencia: verifica si hay datos antes de insertar

**Verificación:**
Migración ejecutada y verificada visualmente en Prisma Studio.
Todos los registros normalizados correctamente.

**Decisión:**
`seed_data.sql` no fue modificado — la normalización ocurre
íntegramente en memoria dentro del script.

---

## 2026-05-19 19:00 — Frontend Sprint 1

**Implementado:**
- `apps/web/src/lib/httpClient.ts`: wrapper fetch con header
  `Authorization: Bearer <token>` e interceptor 401 que redirige a `/login`
- `AuthContext.tsx`: token JWT en localStorage, inicialización síncrona
- Módulos frontend para los 4 bounded contexts del Sprint 1:
  - `auth`: LoginPage con react-hook-form + zod
  - `catalog`: ProductList, ProductForm, CatalogPage con búsqueda
    debounced 300ms
  - `inventory`: tabla de stock con filtro por almacén, AdjustStockForm
  - `sales`: SalesPage con SaleForm y useFieldArray para líneas de producto,
    cálculo de total con useWatch y calculateSaleTotal en tiempo real

---

## 2026-05-19 19:45 — Módulo Notifications (backend)

**Hallazgo:**
El legacy tenía un caché `_NOTIF_CACHE` global con invalidación
incorrecta: `delete` y `create` no lo limpiaban correctamente,
devolviendo datos desactualizados. También tenía `count_unread` con
SQL injection y `latest_for_user` duplicando lógica de `list_for_user`.

**Implementado:**
- Dominio: entidad `Notification` con tipos `info|warn|alert|system|marketing`
  y estados `unread|read`
- Casos de uso: `ListNotifications`, `CreateNotification`,
  `BroadcastNotification`, `MarkAsRead`, `DeleteNotification`
- `BroadcastNotification` usa `IUserRepository.listAllIds()` —
  separación limpia sin acoplamiento directo entre módulos
- Router: `GET /user/:uid` con guard de propiedad, `POST /broadcast`
  restringido a admin

**Decisión:**
Sin caché en memoria. Prisma + SQLite es suficiente para el volumen
de un ERP de PyME. La caché incorrecta del legacy era un bug activo.

**Debug:**
HTTP 404 en `/api/notifications/user/1` después de implementar el módulo.
Causa: proceso de API corriendo sin el router registrado.
Fix: reinicio del servidor.

---

## 2026-05-19 20:15 — Módulo Notifications (frontend)

**Implementado:**
- `NotificationList`: lista con botones "marcar leída" y "eliminar"
- `NotificationBadge`: muestra conteo de no leídas con `refetchInterval: 30000`
  — polling cada 30s sin WebSocket para mantenerse simple
- `BroadcastForm`: disponible sólo para admins
- `useNotifications`: hooks con TanStack Query, `invalidateQueries`
  tras mutaciones
- `NotificationsPage`: con error state para fallos de mutación

---

## 2026-05-19 20:45 — Módulo Purchases (backend)

**Hallazgos en el legacy:**
- `reconcile_purchase` no validaba si la compra ya estaba reconciliada
  — se podía reconciliar el mismo registro múltiples veces
- No se registraban movimientos de inventario al recibir mercancía

**Implementado:**
- Dominio: `Purchase` con estados `pending|received|reconciled`
- Casos de uso: `CreatePurchase`, `ReconcilePurchase`, `ListPurchases`,
  `ListSuppliers`
- `ReconcilePurchase`: valida estado antes de persistir, lanza
  `AppError('La compra ya fue reconciliada', 400)` si ya está en ese estado
- `CreatePurchase`: incrementa stock en almacén por defecto (`DEFAULT_WAREHOUSE_ID = 1`)
  — simplificación consciente documentada

---

## 2026-05-19 21:00 — Módulo Purchases (frontend)

**Implementado:**
- `PurchaseList`: tabla con estado visual de cada compra
- `PurchaseForm`: con `useFieldArray` para ítems de compra
- `ReconcileForm`: formulario de referencia bancaria
- `usePurchases`: hooks con TanStack Query
- `PurchasesPage`: integración completa

---

## 2026-05-19 21:30 — Módulo Refunds (backend)

**Hallazgos en el legacy:**
- `amount` guardado como TEXT (`'3335.5'` con comillas)
- Estados con 6 variantes: `'pending'`, `'Approved'`, `'aprobada'`,
  `'done'`, `'rejected'`
- `calc_refund_amount` divergía de `SaleItems` — calculaba sobre
  el total de la venta sin considerar las líneas individuales
- SQL injection en `search_refunds` y `list_refunds_by_user`
- Sin autenticación en algunos endpoints

**Implementado:**
- `amount` como `Decimal` desde el schema
- `CreateRefund`: calcula el monto como `applyVAT(subtotal_items)` —
  mismo cálculo que CreateSale para consistencia
- `ApproveRefund` y `RejectRefund`: validan `isPending()` antes de
  cambiar estado
- `Refund.isPending()`: método de dominio que encapsula la validación
  de estado

---

## 2026-05-19 22:00 — Módulo Refunds (frontend) + bug httpClient

**Implementado:**
- `RefundList` con botones aprobar/rechazar para admins
- `RefundForm` con preview del monto calculado en tiempo real
  usando `useWatch` + llamada a `GET /api/sales/:id`
- `useRefunds`: hooks con TanStack Query

**Bug encontrado y corregido:**
Al accionar "Rechazar" aparecía:
`Bad request: Body cannot be empty when content-type is set to 'application/json'`

Causa: `httpClient.ts` siempre enviaba `Content-Type: application/json`
aunque el request no tuviera body (POST vacíos como approve, reject,
mark-as-read, return-sale).

Fix en `httpClient.ts`:
```typescript
...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {})
```

---

## 2026-05-19 22:30 — Módulo Reports (backend)

**Hallazgos en el legacy:**
- Lógica de descuento duplicada en `logic/reports.py` y `logic/exports.py`
  (también en `logic/finance.py`) — 3 implementaciones distintas
- `get_sales_by_user` duplicado en dos archivos con comportamiento
  ligeramente distinto
- SQL injection en `export_report` y `download_csv`
- `CASE WHEN discount > 0` en SQL construido con concatenación directa

**Implementado:**
- `GetMonthlyReport`, `GetMonthlyTotal`, `ExportSalesCSV`
- Toda la lógica de descuento delegada a `@legacy-nexus/finance`
- `ExportSalesCSV`: usa `escapeCsv()` para cada campo —
  ningún valor del usuario se concatena directamente en el CSV

---

## 2026-05-19 23:00 — Módulo Exports (backend)

**Problema de diseño resuelto:**
Prisma `groupBy()` no soporta agrupación cross-table (ej: ventas
por categoría de producto). El legacy lo resolvía con SQL crudo y
concatenación directa — SQL injection activo.

**Implementado:**
- `GetPivotReport`: dimensiones de fila/columna con whitelist explícita
  (`PivotDimension.ts`) — ninguna cadena del usuario llega a Prisma
- Pivot en memoria: `findMany` con `include` + agregación con `Map`
- `GetAggregateTotals`: totales con VAT recalculado vía `applyVAT()`
  del shared kernel, no con lógica duplicada
- `DownloadCSV`: `escapeCsv()` para todos los valores
- `exportsRouter` montado bajo `/api/reports` — Fastify permite
  múltiples plugins bajo el mismo prefijo, las rutas son aditivas

---

## 2026-05-19 23:30 — Integración de Exports en módulo Reports (frontend)

**Implementado:**
- `ReportsPage` con 3 pestañas: Mensual / Totales Agregados / Análisis Dimensional
- `PivotTable`: renderizado dinámico de columnas desde la respuesta del servidor
- `PivotControls`: selectores de año, dimensión fila y columna
- `AggregateTotalsCard`: componente autónomo con su propio estado año/tipo
- `useReports.ts`: hooks `usePivotReport` (con flag `pivotReady` para evitar
  fetch automático en mount), `useAggregateTotals`, `useDownloadCSV`
- Link a Reportes en el nav sólo visible para admins

---

## 2026-05-19 23:50 — Manejo de errores (backend + frontend)

**Problema identificado:**
Los routers usaban string-matching para determinar el status HTTP:
```typescript
const status = message.includes('no encontrado') ? 404 : 400
```
Frágil — un cambio de mensaje en un caso de uso rompía silenciosamente
el código de respuesta HTTP.

**Implementado — Backend:**
- `apps/api/src/lib/AppError.ts`: clase con `statusCode` explícito
- `setErrorHandler` global en `index.ts` con tipado `FastifyError`
- Todos los casos de uso lanzan `AppError` con el código correcto
  en lugar de `new Error` genérico
- Corrección de paths de import: `../../../../lib/AppError.js` (incorrecto)
  → `../../../lib/AppError.js` (correcto desde `modules/*/application/`)
- Todos los routers usan `instanceof AppError` → `err.statusCode`;
  errores no-AppError caen al catch-all con 500
- Rutas GET que no tenían try/catch envueltas: catalog `/` y `/search`,
  inventory `/`, `/warehouse/:id`, `/stock/:pid`, sales `/:id` y `/user/:id`,
  purchases `/` y `/suppliers`, refunds `/user/:id`, notifications `/user/:uid`,
  reports (las 3 rutas GET)

**Implementado — Frontend:**
- `httpClient.ts`: `fetch` envuelto en try/catch, lanza
  `'No se pudo conectar al servidor'` en fallo de red
- `CatalogPage`: `deleteProduct.mutate` con `onError`, muestra
  mensaje inline
- `NotificationsPage`: error state compartido para `markAsRead`
  y `deleteNotification` con `onError`

---

## 2026-05-19 23:58 — CSS global

**Implementado:**
- `apps/web/src/index.css`: reset, design tokens como variables CSS
  (colores, radios, sombras, tipografía), base styles para inputs,
  botones, tablas; clases utilitarias `.badge--*` y `.card`
- Paleta extraída de los valores inline ya existentes en los componentes
  (`#1a1a2e`, `#e0e0ff`, etc.) para coherencia sin romper estilos actuales
- Importado en `main.tsx`

---

## 2026-05-19 23:59 — Documentación

**Creado:**
- `docs/adr/ADR-001.md`: Elección de arquitectura (Clean Architecture
  vs Vertical Slices vs MVC)
- `docs/adr/ADR-002.md`: Stack tecnológico (Fastify vs Express,
  Prisma vs Drizzle, Vite vs Next.js, SQLite vs PostgreSQL)
- `docs/adr/ADR-003.md`: Estrategia de migración de datos (script seed
  con normalización vs ETL vs reusar el .db del legacy)
- `docs/adr/ADR-004.md`: Estrategia de seguridad (rediseño estructural
  vs parches puntuales — SQL injection, auth bypass, bcrypt, stock negativo)
- `README.md`: descripción del proyecto, instrucciones de arranque
  en máquina limpia, estructura del monorepo con árbol anotado
