import { AppError } from '../../../lib/AppError.js'
import type { IRefundRepository } from '../domain/IRefundRepository.js'
import type { Refund } from '../domain/Refund.js'

export class ApproveRefund {
  constructor(private readonly refundRepo: IRefundRepository) {}

  async execute(params: { refundId: number; approvedBy: number }): Promise<Refund> {
    const refund = await this.refundRepo.findById(params.refundId)
    if (!refund) throw new AppError('Reembolso no encontrado', 404)
    if (!refund.isPending()) throw new AppError(`El reembolso ya tiene status '${refund.status}'`, 400)
    return this.refundRepo.approve(params.refundId, params.approvedBy)
  }
}
