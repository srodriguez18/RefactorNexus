import type { FastifyInstance } from 'fastify'
import type { CreateRefundDto } from '@legacy-nexus/shared'
import { AppError } from '../../../lib/AppError.js'
import { prisma } from '../../../lib/prisma.js'
import { verifyToken, verifyAdmin } from '../../auth/interface/auth.middleware.js'
import { SaleRepositoryPrisma } from '../../sales/infrastructure/SaleRepositoryPrisma.js'
import { RefundRepositoryPrisma } from '../infrastructure/RefundRepositoryPrisma.js'
import { CreateRefund } from '../application/CreateRefund.js'
import { ApproveRefund } from '../application/ApproveRefund.js'
import { RejectRefund } from '../application/RejectRefund.js'
import { ListRefundsByUser } from '../application/ListRefundsByUser.js'

export async function refundsRouter(app: FastifyInstance): Promise<void> {
  const refundRepo = new RefundRepositoryPrisma(prisma)
  const saleRepo = new SaleRepositoryPrisma(prisma)
  const createRefund = new CreateRefund(refundRepo, saleRepo)
  const approveRefund = new ApproveRefund(refundRepo)
  const rejectRefund = new RejectRefund(refundRepo)
  const listRefundsByUser = new ListRefundsByUser(refundRepo)

  app.post<{ Body: CreateRefundDto }>(
    '/',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const refund = await createRefund.execute({
          saleId: request.body.saleId,
          userId: request.user!.userId,
          reason: request.body.reason,
        })
        return reply.status(201).send(refund)
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )

  app.post<{ Params: { id: string } }>(
    '/:id/approve',
    { preHandler: verifyAdmin },
    async (request, reply) => {
      try {
        const refund = await approveRefund.execute({
          refundId: Number(request.params.id),
          approvedBy: request.user!.userId,
        })
        return reply.send(refund)
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )

  app.post<{ Params: { id: string } }>(
    '/:id/reject',
    { preHandler: verifyAdmin },
    async (request, reply) => {
      try {
        const refund = await rejectRefund.execute({ refundId: Number(request.params.id) })
        return reply.send(refund)
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
        const refunds = await listRefundsByUser.execute(targetUserId)
        return reply.send(refunds)
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )
}
