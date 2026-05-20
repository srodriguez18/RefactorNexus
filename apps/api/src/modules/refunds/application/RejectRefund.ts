import type { IRefundRepository } from '../domain/IRefundRepository.js'
import type { Refund } from '../domain/Refund.js'

export class RejectRefund {
  constructor(private readonly refundRepo: IRefundRepository) {}

  async execute(params: { refundId: number }): Promise<Refund> {
    const refund = await this.refundRepo.findById(params.refundId)
    if (!refund) throw new Error('Reembolso no encontrado')
    if (!refund.isPending()) throw new Error(`El reembolso ya tiene status '${refund.status}'`)
    return this.refundRepo.reject(params.refundId)
  }
}
