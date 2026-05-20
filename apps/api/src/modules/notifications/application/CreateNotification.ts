import { AppError } from '../../../lib/AppError.js'
import type { INotificationRepository } from '../domain/INotificationRepository.js'
import type { Notification, NotificationKind } from '../domain/Notification.js'

const VALID_KINDS: NotificationKind[] = ['info', 'warn', 'alert', 'system', 'marketing']

export class CreateNotification {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(params: { userId: number; message: string; kind: string }): Promise<Notification> {
    if (!VALID_KINDS.includes(params.kind as NotificationKind)) {
      throw new AppError('Tipo de notificación inválido', 400)
    }
    return this.notificationRepo.create({
      userId: params.userId,
      message: params.message,
      kind: params.kind as NotificationKind,
    })
  }
}
