import type { IInventoryRepository, StockDetail } from '../domain/IInventoryRepository.js'

export class ListInventory {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async execute(): Promise<StockDetail[]> {
    return this.inventoryRepo.listStock()
  }
}
