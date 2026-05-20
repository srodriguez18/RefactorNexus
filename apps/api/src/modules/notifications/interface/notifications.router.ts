import type { FastifyInstance } from 'fastify'
import type { CreateNotificationDto, BroadcastNotificationDto } from '@legacy-nexus/shared'
import { AppError } from '../../../lib/AppError.js'
import { prisma } from '../../../lib/prisma.js'
import { verifyToken, verifyAdmin } from '../../auth/interface/auth.middleware.js'
import { UserRepositoryPrisma } from '../../auth/infrastructure/UserRepositoryPrisma.js'
import { NotificationRepositoryPrisma } from '../infrastructure/NotificationRepositoryPrisma.js'
import { ListNotifications } from '../application/ListNotifications.js'
import { CreateNotification } from '../application/CreateNotification.js'
import { BroadcastNotification } from '../application/BroadcastNotification.js'
import { MarkAsRead } from '../application/MarkAsRead.js'
import { DeleteNotification } from '../application/DeleteNotification.js'

export async function notificationsRouter(app: FastifyInstance): Promise<void> {
  const notificationRepo = new NotificationRepositoryPrisma(prisma)
  const userRepo = new UserRepositoryPrisma(prisma)
  const listNotifications = new ListNotifications(notificationRepo)
  const createNotification = new CreateNotification(notificationRepo)
  const broadcastNotification = new BroadcastNotification(notificationRepo, userRepo)
  const markAsRead = new MarkAsRead(notificationRepo)
  const deleteNotification = new DeleteNotification(notificationRepo)

  app.get<{ Params: { uid: string } }>(
    '/user/:uid',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const targetUserId = Number(request.params.uid)
        if (request.user!.userId !== targetUserId && !request.user!.isAdmin) {
          return reply.status(403).send({ error: 'Acceso denegado' })
        }
        const notifications = await listNotifications.execute(targetUserId)
        return reply.send(notifications)
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )

  app.post<{ Body: CreateNotificationDto }>(
    '/',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        const notification = await createNotification.execute(request.body)
        return reply.status(201).send(notification)
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )

  app.post<{ Body: BroadcastNotificationDto }>(
    '/broadcast',
    { preHandler: verifyAdmin },
    async (request, reply) => {
      try {
        const count = await broadcastNotification.execute(request.body)
        return reply.status(201).send({ count })
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )

  app.post<{ Params: { id: string } }>(
    '/:id/read',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        await markAsRead.execute(Number(request.params.id))
        return reply.status(204).send()
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )

  app.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: verifyToken },
    async (request, reply) => {
      try {
        await deleteNotification.execute(Number(request.params.id))
        return reply.status(204).send()
      } catch (err) {
        if (err instanceof AppError) return reply.status(err.statusCode).send({ error: err.message })
        return reply.status(500).send({ error: 'Error interno del servidor' })
      }
    },
  )
}
