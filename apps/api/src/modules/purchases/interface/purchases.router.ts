import type { FastifyInstance } from 'fastify'
import type { CreatePurchaseDto, ReconcileDto } from '@legacy-nexus/shared'
import { AppError } from '../../../lib/AppError.js'
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
    try {
      const purchases = await listPurchases.execute()
      return reply.send(purchases)
    } catch (err) {
      if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
      return reply.status(500).send({ error: 'Error interno del servidor' })
    }
  })

  app.get('/suppliers', { preHandler: verifyToken }, async (_request, reply) => {
    try {
      const suppliers = await listSuppliers.execute()
      return reply.send(suppliers)
    } catch (err) {
      if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
      return reply.status(500).send({ error: 'Error interno del servidor' })
    }
  })

  app.post<{ Body: CreatePurchaseDto }>(
    '/',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const purchase = await createPurchase.execute(request.body)
        return reply.status(201).send(purchase)
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
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
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )
}
