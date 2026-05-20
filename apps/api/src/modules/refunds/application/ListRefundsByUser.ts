import type { IRefundRepository } from '../domain/IRefundRepository.js'
import type { Refund } from '../domain/Refund.js'

export class ListRefundsByUser {
  constructor(private readonly refundRepo: IRefundRepository) {}

  async execute(userId: number): Promise<Refund[]> {
    return this.refundRepo.listByUser(userId)
  }
}
