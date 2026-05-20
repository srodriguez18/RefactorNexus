import type { FastifyInstance } from 'fastify'
import type { CreateNotificationDto, BroadcastNotificationDto } from '@legacy-nexus/shared'
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
      const targetUserId = Number(request.params.uid)
      if (request.user!.userId !== targetUserId && !request.user!.isAdmin) {
        return reply.status(403).send({ error: 'Acceso denegado' })
      }
      const notifications = await listNotifications.execute(targetUserId)
      return reply.send(notifications)
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
        const message = err instanceof Error ? err.message : 'Error al crear notificación'
        const status = message.includes('inválido') ? 400 : 500
        return reply.status(status).send({ error: message })
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
        const message = err instanceof Error ? err.message : 'Error en broadcast'
        const status = message.includes('inválido') ? 400 : 500
        return reply.status(status).send({ error: message })
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
        const message = err instanceof Error ? err.message : 'Error al marcar notificación'
        const status = message.includes('no encontrada') ? 404 : 500
        return reply.status(status).send({ error: message })
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
        const message = err instanceof Error ? err.message : 'Error al eliminar notificación'
        const status = message.includes('no encontrada') ? 404 : 500
        return reply.status(status).send({ error: message })
      }
    },
  )
}
