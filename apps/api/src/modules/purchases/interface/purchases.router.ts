import type { FastifyInstance } from 'fastify'
import type { CreatePurchaseDto, ReconcileDto } from '@legacy-nexus/shared'
import { prisma } from '../../../lib/prisma.js'
import { verifyToken, verifyAdmin } from '../../auth/interface/auth.middleware.js'
import { InventoryRepositoryPrisma } from '../../inventory/infrastructure/InventoryRepositoryPrisma.js'
import { PurchaseRepositoryPrisma } from '../infrastructure/PurchaseRepositoryPrisma.js'
import { CreatePurchase } from '../application/CreatePurchase.js'
import { ReconcilePurchase } from '../application/ReconcilePurchase.js'
import { ListPurchases } from '../application/ListPurchases.js'
import { ListSuppliers } from '../application/ListSuppliers.js'

export async function purchasesRouter(app: FastifyInstance): Promise<void> {
  const purchaseRepo = new PurchaseRepositoryPrisma(prisma)
  const inventoryRepo = new InventoryRepositoryPrisma(prisma)
  const createPurchase = new CreatePurchase(purchaseRepo, inventoryRepo)
  const reconcilePurchase = new ReconcilePurchase(purchaseRepo)
  const listPurchases = new ListPurchases(purchaseRepo)
  const listSuppliers = new ListSuppliers(purchaseRepo)

  app.get('/', { preHandler: verifyToken }, async (_request, reply) => {
    const purchases = await listPurchases.execute()
    return reply.send(purchases)
  })

  app.get('/suppliers', { preHandler: verifyToken }, async (_request, reply) => {
    const suppliers = await listSuppliers.execute()
    return reply.send(suppliers)
  })

  app.post<{ Body: CreatePurchaseDto }>(
    '/',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const purchase = await createPurchase.execute(request.body)
        return reply.status(201).send(purchase)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al crear compra'
        return reply.status(400).send({ error: message })
      }
    },
  )

  app.post<{ Params: { id: string }; Body: ReconcileDto }>(
    '/:id/reconcile',
    { preHandler: verifyAdmin },
    async (request, reply) => {
      try {
        const purchase = await reconcilePurchase.execute({
          purchaseId: Number(request.params.id),
          bankRef: request.body.bankRef,
        })
        return reply.send(purchase)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al reconciliar compra'
        const status = message.includes('no encontrada') ? 404 : 400
        return reply.status(status).send({ error: message })
      }
    },
  )
}
