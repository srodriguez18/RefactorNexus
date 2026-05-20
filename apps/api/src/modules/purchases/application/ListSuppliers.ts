import type { IPurchaseRepository, Supplier } from '../domain/IPurchaseRepository.js'

export class ListSuppliers {
  constructor(private readonly purchaseRepo: IPurchaseRepository) {}

  async execute(): Promise<Supplier[]> {
    return this.purchaseRepo.listSuppliers()
  }
}
