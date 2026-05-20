import type { FastifyInstance } from 'fastify'
import type { CreateProductDto } from '@legacy-nexus/shared'
import { AppError } from '../../../lib/AppError.js'
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
    try {
      const products = await listProducts.execute()
      return reply.send(products)
    } catch (err) {
      if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
      return reply.status(500).send({ error: 'Error interno del servidor' })
    }
  })

  app.get<{ Querystring: { q?: string } }>('/search', async (request, reply) => {
    try {
      const products = await searchProducts.execute(request.query.q ?? '')
      return reply.send(products)
    } catch (err) {
      if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
      return reply.status(500).send({ error: 'Error interno del servidor' })
    }
  })

  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const product = await getProduct.execute(Number(request.params.id))
      return reply.send(product)
    } catch (err) {
      if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
      return reply.status(500).send({ error: 'Error interno del servidor' })
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
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
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
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )
}
