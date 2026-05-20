export type RefundStatus = 'pending' | 'approved' | 'rejected'

export class Refund {
  constructor(
    readonly id: number,
    readonly saleId: number,
    readonly userId: number,
    readonly reason: string,
    readonly amount: number,
    readonly status: RefundStatus,
    readonly approvedBy: number | null,
    readonly createdAt: Date,
  ) {}

  isPending(): boolean {
    return this.status === 'pending'
  }
}
