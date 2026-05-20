import type { IInventoryRepository } from '../domain/IInventoryRepository.js'

export class GetStock {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async execute(productId: number, warehouseId?: number): Promise<number> {
    return this.inventoryRepo.getStock(productId, warehouseId)
  }
}
