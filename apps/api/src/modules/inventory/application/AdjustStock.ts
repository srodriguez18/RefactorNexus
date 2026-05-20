import type { IInventoryRepository } from '../domain/IInventoryRepository.js'
import type { MovementType } from '../domain/InventoryMovement.js'
import { InventoryStock } from '../domain/InventoryStock.js'

export interface AdjustStockParams {
  productId: number
  warehouseId: number
  quantity: number
  type: MovementType
}

export class AdjustStock {
  constructor(private readonly inventoryRepo: IInventoryRepository) {}

  async execute(params: AdjustStockParams): Promise<void> {
    const { productId, warehouseId, quantity, type } = params

    if (type === 'OUT') {
      const currentQty = await this.inventoryRepo.getStock(productId, warehouseId)
      const stock = new InventoryStock(productId, warehouseId, currentQty)

      if (!stock.canDecrement(quantity)) {
        throw new Error('Stock insuficiente')
      }
      await this.inventoryRepo.decrement(productId, warehouseId, quantity)
    } else {
      await this.inventoryRepo.increment(productId, warehouseId, quantity)
    }

    // Siempre registrar el movimiento — corrige bug legacy donde compras no lo registraban
    await this.inventoryRepo.registerMovement({ productId, warehouseId, quantity, type })
  }
}
