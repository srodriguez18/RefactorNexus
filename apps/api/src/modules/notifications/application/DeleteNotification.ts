import type { INotificationRepository } from '../domain/INotificationRepository.js'

export class DeleteNotification {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(notificationId: number): Promise<void> {
    const notification = await this.notificationRepo.findById(notificationId)
    if (!notification) throw new Error('Notificación no encontrada')
    await this.notificationRepo.delete(notificationId)
  }
}
