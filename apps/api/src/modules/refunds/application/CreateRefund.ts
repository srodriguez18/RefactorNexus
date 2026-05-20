import { applyVAT } from '@legacy-nexus/finance'
import type { IRefundRepository } from '../domain/IRefundRepository.js'
import type { Refund } from '../domain/Refund.js'
import type { ISaleRepository } from '../../sales/domain/ISaleRepository.js'

export class CreateRefund {
  constructor(
    private readonly refundRepo: IRefundRepository,
    private readonly saleRepo: ISaleRepository,
  ) {}

  async execute(params: { saleId: number; userId: number; reason: string }): Promise<Refund> {
    const sale = await this.saleRepo.findById(params.saleId)
    if (!sale) throw new Error('Venta no encontrada')

    const subtotal = sale.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const amount = applyVAT(subtotal)

    return this.refundRepo.create({
      saleId: params.saleId,
      userId: params.userId,
      reason: params.reason,
      amount,
    })
  }
}
