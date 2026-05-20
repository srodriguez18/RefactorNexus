import type { IPurchaseRepository } from '../domain/IPurchaseRepository.js'
import type { Purchase } from '../domain/Purchase.js'

export class ListPurchases {
  constructor(private readonly purchaseRepo: IPurchaseRepository) {}

  async execute(): Promise<Purchase[]> {
    return this.purchaseRepo.list()
  }
}
