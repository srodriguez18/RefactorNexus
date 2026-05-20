export type NotificationKind = 'info' | 'warn' | 'alert' | 'system' | 'marketing'
export type NotificationStatus = 'unread' | 'read'

export class Notification {
  constructor(
    readonly id: number,
    readonly userId: number,
    readonly message: string,
    readonly kind: NotificationKind,
    readonly status: NotificationStatus,
    readonly createdAt: Date,
  ) {}
}
