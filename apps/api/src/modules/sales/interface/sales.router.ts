import type { FastifyInstance } from 'fastify'
import type { CreateSaleDto } from '@legacy-nexus/shared'
import { AppError } from '../../../lib/AppError.js'
import { prisma } from '../../../lib/prisma.js'
import { verifyToken } from '../../auth/interface/auth.middleware.js'
import { ProductRepositoryPrisma } from '../../catalog/infrastructure/ProductRepositoryPrisma.js'
import { InventoryRepositoryPrisma } from '../../inventory/infrastructure/InventoryRepositoryPrisma.js'
import { SaleRepositoryPrisma } from '../infrastructure/SaleRepositoryPrisma.js'
import { CreateSale } from '../application/CreateSale.js'
import { ReturnSale } from '../application/ReturnSale.js'

export async function salesRouter(app: FastifyInstance): Promise<void> {
  const saleRepo = new SaleRepositoryPrisma(prisma)
  const productRepo = new ProductRepositoryPrisma(prisma)
  const inventoryRepo = new InventoryRepositoryPrisma(prisma)
  const createSale = new CreateSale(saleRepo, productRepo, inventoryRepo)
  const returnSale = new ReturnSale(saleRepo, inventoryRepo)

  app.post<{ Body: CreateSaleDto }>(
    '/',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const summary = await createSale.execute({
          userId: request.user!.userId,
          customerType: request.body.customerType,
          items: request.body.items,
        })
        return reply.status(201).send(summary)
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )

  app.post<{ Params: { id: string } }>(
    '/:id/return',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const sale = await returnSale.execute(Number(request.params.id))
        return reply.send(sale)
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )

  app.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const sale = await saleRepo.findById(Number(request.params.id))
        if (!sale) return reply.status(404).send({ error: 'Venta no encontrada' })
        if (request.user!.userId !== sale.userId && !request.user!.isAdmin) {
          return reply.status(403).send({ error: 'Acceso denegado' })
        }
        return reply.send(sale)
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )

  app.get<{ Params: { id: string } }>(
    '/user/:id',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const targetUserId = Number(request.params.id)
        if (request.user!.userId !== targetUserId && !request.user!.isAdmin) {
          return reply.status(403).send({ error: 'Acceso denegado' })
        }
        const sales = await saleRepo.listByUser(targetUserId)
        return reply.send(sales)
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )
}
