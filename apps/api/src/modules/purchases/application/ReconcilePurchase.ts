import type { IPurchaseRepository } from '../domain/IPurchaseRepository.js'
import type { Purchase } from '../domain/Purchase.js'

export class ReconcilePurchase {
  constructor(private readonly purchaseRepo: IPurchaseRepository) {}

  async execute(params: { purchaseId: number; bankRef: string }): Promise<Purchase> {
    const purchase = await this.purchaseRepo.findById(params.purchaseId)
    if (!purchase) throw new Error('Compra no encontrada')
    if (purchase.status === 'reconciled') {
      throw new Error('La compra ya fue reconciliada')
    }
    return this.purchaseRepo.reconcile(params.purchaseId, params.bankRef)
  }
}
