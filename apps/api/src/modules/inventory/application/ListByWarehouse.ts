import type { IInventoryRepository, StockDetail } from '../domain/IInventoryRepository.js'

export class ListByWarehouse {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async execute(warehouseId: number): Promise<StockDetail[]> {
    return this.inventoryRepo.listByWarehouse(warehouseId)
  }
}
