import type { Notification, NotificationKind } from './Notification.js'

export interface CreateNotificationData {
  userId: number
  message: string
  kind: NotificationKind
}

export interface INotificationRepository {
  listByUser(userId: number): Promise<Notification[]>
  findById(id: number): Promise<Notification | null>
  create(data: CreateNotificationData): Promise<Notification>
  createMany(userIds: number[], message: string, kind: NotificationKind): Promise<number>
  markAsRead(id: number): Promise<void>
  delete(id: number): Promise<void>
}
