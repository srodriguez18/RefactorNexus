import type { FastifyInstance } from 'fastify'
import type { AdjustStockDto } from '@legacy-nexus/shared'
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
    const stock = await listInventory.execute()
    return reply.send(stock)
  })

  app.get<{ Params: { id: string } }>('/warehouse/:id', async (request, reply) => {
    const stock = await listByWarehouse.execute(Number(request.params.id))
    return reply.send(stock)
  })

  app.get<{ Params: { pid: string }; Querystring: { warehouseId?: string } }>(
    '/stock/:pid',
    async (request, reply) => {
      const productId = Number(request.params.pid)
      const warehouseId = request.query.warehouseId
        ? Number(request.query.warehouseId)
        : undefined
      const quantity = await getStock.execute(productId, warehouseId)
      return reply.send({ productId, warehouseId, quantity })
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
        const message = err instanceof Error ? err.message : 'Error al ajustar stock'
        return reply.status(400).send({ error: message })
      }
    },
  )
}
