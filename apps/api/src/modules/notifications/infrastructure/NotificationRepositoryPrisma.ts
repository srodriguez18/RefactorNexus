import type { PrismaClient } from '@prisma/client'
import type { INotificationRepository, CreateNotificationData } from '../domain/INotificationRepository.js'
import { Notification } from '../domain/Notification.js'
import type { NotificationKind, NotificationStatus } from '../domain/Notification.js'

export class NotificationRepositoryPrisma implements INotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapRow(row: {
    id: number
    userId: number
    message: string
    kind: string
    status: string
    createdAt: Date
  }): Notification {
    return new Notification(
      row.id,
      row.userId,
      row.message,
      row.kind as NotificationKind,
      row.status as NotificationStatus,
      row.createdAt,
    )
  }

  async listByUser(userId: number): Promise<Notification[]> {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((r) => this.mapRow(r))
  }

  async findById(id: number): Promise<Notification | null> {
    const row = await this.prisma.notification.findUnique({ where: { id } })
    return row ? this.mapRow(row) : null
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    const row = await this.prisma.notification.create({ data })
    return this.mapRow(row)
  }

  async createMany(userIds: number[], message: string, kind: NotificationKind): Promise<number> {
    const result = await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, message, kind })),
    })
    return result.count
  }

  async markAsRead(id: number): Promise<void> {
    await this.prisma.notification.update({ where: { id }, data: { status: 'read' } })
  }

  async delete(id: number): Promise<void> {
    await this.prisma.notification.delete({ where: { id } })
  }
}
