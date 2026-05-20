import type { FastifyInstance } from 'fastify'
import type { CreateProductDto } from '@legacy-nexus/shared'
import { prisma } from '../../../lib/prisma.js'
import { verifyToken, verifyAdmin } from '../../auth/interface/auth.middleware.js'
import { ProductRepositoryPrisma } from '../infrastructure/ProductRepositoryPrisma.js'
import { ListProducts } from '../application/ListProducts.js'
import { GetProduct } from '../application/GetProduct.js'
import { SearchProducts } from '../application/SearchProducts.js'
import { CreateProduct } from '../application/CreateProduct.js'
import { DeleteProduct } from '../application/DeleteProduct.js'

export async function catalogRouter(app: FastifyInstance): Promise<void> {
  const productRepo = new ProductRepositoryPrisma(prisma)
  const listProducts = new ListProducts(productRepo)
  const getProduct = new GetProduct(productRepo)
  const searchProducts = new SearchProducts(productRepo)
  const createProduct = new CreateProduct(productRepo)
  const deleteProduct = new DeleteProduct(productRepo)

  app.get('/', async (_request, reply) => {
    const products = await listProducts.execute()
    return reply.send(products)
  })

  app.get<{ Querystring: { q?: string } }>('/search', async (request, reply) => {
    const products = await searchProducts.execute(request.query.q ?? '')
    return reply.send(products)
  })

  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const product = await getProduct.execute(Number(request.params.id))
      return reply.send(product)
    } catch {
      return reply.status(404).send({ error: 'Producto no encontrado' })
    }
  })

  app.post<{ Body: CreateProductDto }>(
    '/',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const product = await createProduct.execute(request.body)
        return reply.status(201).send(product)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al crear producto'
        return reply.status(400).send({ error: message })
      }
    },
  )

  app.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: verifyAdmin },
    async (request, reply) => {
      try {
        await deleteProduct.execute(Number(request.params.id))
        return reply.status(204).send()
      } catch {
        return reply.status(404).send({ error: 'Producto no encontrado' })
      }
    },
  )
}
