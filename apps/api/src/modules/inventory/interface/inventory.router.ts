import type { FastifyInstance } from 'fastify'
import type { AdjustStockDto } from '@legacy-nexus/shared'
import { AppError } from '../../../lib/AppError.js'
import { prisma } from '../../../lib/prisma.js'
import { verifyToken } from '../../auth/interface/auth.middleware.js'
import { InventoryRepositoryPrisma } from '../infrastructure/InventoryRepositoryPrisma.js'
import { ListInventory } from '../application/ListInventory.js'
import { ListByWarehouse } from '../application/ListByWarehouse.js'
import { GetStock } from '../application/GetStock.js'
import { AdjustStock } from '../application/AdjustStock.js'

export async function inventoryRouter(app: FastifyInstance): Promise<void> {
  const inventoryRepo = new InventoryRepositoryPrisma(prisma)
  const listInventory = new ListInventory(inventoryRepo)
  const listByWarehouse = new ListByWarehouse(inventoryRepo)
  const getStock = new GetStock(inventoryRepo)
  const adjustStock = new AdjustStock(inventoryRepo)

  app.get('/', async (_request, reply) => {
    try {
      const stock = await listInventory.execute()
      return reply.send(stock)
    } catch (err) {
      if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
      return reply.status(500).send({ error: 'Error interno del servidor' })
    }
  })

  app.get<{ Params: { id: string } }>('/warehouse/:id', async (request, reply) => {
    try {
      const stock = await listByWarehouse.execute(Number(request.params.id))
      return reply.send(stock)
    } catch (err) {
      if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
      return reply.status(500).send({ error: 'Error interno del servidor' })
    }
  })

  app.get<{ Params: { pid: string }; Querystring: { warehouseId?: string } }>(
    '/stock/:pid',
    async (request, reply) => {
      try {
        const productId = Number(request.params.pid)
        const warehouseId = request.query.warehouseId
          ? Number(request.query.warehouseId)
          : undefined
        const quantity = await getStock.execute(productId, warehouseId)
        return reply.send({ productId, warehouseId, quantity })
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )

  app.post<{ Body: AdjustStockDto }>(
    '/adjust',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        await adjustStock.execute(request.body)
        return reply.status(204).send()
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )
}
