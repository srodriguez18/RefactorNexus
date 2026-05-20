import Fastify from 'fastify'
import cors from '@fastify/cors'
import { authRouter } from './modules/auth/interface/auth.router.js'
import { catalogRouter } from './modules/catalog/interface/catalog.router.js'
import { inventoryRouter } from './modules/inventory/interface/inventory.router.js'
import { salesRouter } from './modules/sales/interface/sales.router.js'
import { notificationsRouter } from './modules/notifications/interface/notifications.router.js'
import { purchasesRouter } from './modules/purchases/interface/purchases.router.js'
import { refundsRouter } from './modules/refunds/interface/refunds.router.js'
import { reportsRouter } from './modules/reports/interface/reports.router.js'
import { exportsRouter } from './modules/exports/interface/exports.router.js'

const app = Fastify({ logger: true })

await app.register(cors)

app.get('/health', async () => {
  return { status: 'ok' }
})

await app.register(authRouter, { prefix: '/api/auth' })
await app.register(catalogRouter, { prefix: '/api/catalog' })
await app.register(inventoryRouter, { prefix: '/api/inventory' })
await app.register(salesRouter, { prefix: '/api/sales' })
await app.register(notificationsRouter, { prefix: '/api/notifications' })
await app.register(purchasesRouter, { prefix: '/api/purchases' })
await app.register(refundsRouter, { prefix: '/api/refunds' })
await app.register(reportsRouter, { prefix: '/api/reports' })
await app.register(exportsRouter, { prefix: '/api/reports' })

try {
  await app.listen({ port: 3000, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
