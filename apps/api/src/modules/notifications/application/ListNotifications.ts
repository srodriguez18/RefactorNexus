import type { INotificationRepository } from '../domain/INotificationRepository.js'
import type { Notification } from '../domain/Notification.js'

export class ListNotifications {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(userId: number): Promise<Notification[]> {
    return this.notificationRepo.listByUser(userId)
  }
}
