import { AppError } from '../../../lib/AppError.js'
import type { IPurchaseRepository } from '../domain/IPurchaseRepository.js'
import type { Purchase } from '../domain/Purchase.js'

export class ReconcilePurchase {
  constructor(private readonly purchaseRepo: IPurchaseRepository) {}

  async execute(params: { purchaseId: number; bankRef: string }): Promise<Purchase> {
    const purchase = await this.purchaseRepo.findById(params.purchaseId)
    if (!purchase) throw new AppError('Compra no encontrada', 404)
    if (purchase.status === 'reconciled') throw new AppError('La compra ya fue reconciliada', 400)
    return this.purchaseRepo.reconcile(params.purchaseId, params.bankRef)
  }
}
