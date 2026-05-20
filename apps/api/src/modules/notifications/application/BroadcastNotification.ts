import { AppError } from '../../../lib/AppError.js'
import type { INotificationRepository } from '../domain/INotificationRepository.js'
import type { NotificationKind } from '../domain/Notification.js'
import type { IUserRepository } from '../../auth/domain/IUserRepository.js'

const VALID_KINDS: NotificationKind[] = ['info', 'warn', 'alert', 'system', 'marketing']

export class BroadcastNotification {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(params: { message: string; kind: string }): Promise<number> {
    if (!VALID_KINDS.includes(params.kind as NotificationKind)) {
      throw new AppError('Tipo de notificación inválido', 400)
    }
    const userIds = await this.userRepo.listAllIds()
    if (userIds.length === 0) return 0
    return this.notificationRepo.createMany(userIds, params.message, params.kind as NotificationKind)
  }
}
