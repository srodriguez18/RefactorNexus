import type { MovementType } from './InventoryMovement.js'

export interface StockDetail {
  productId: number
  productName: string
  warehouseId: number
  warehouseName: string
  quantity: number
}

export interface RegisterMovementData {
  productId: number
  warehouseId: number
  quantity: number
  type: MovementType
  refId?: number
}

export interface IInventoryRepository {
  getStock(productId: number, warehouseId?: number): Promise<number>
  listStock(): Promise<StockDetail[]>
  listByWarehouse(warehouseId: number): Promise<StockDetail[]>
  decrement(productId: number, warehouseId: number, quantity: number): Promise<void>
  increment(productId: number, warehouseId: number, quantity: number): Promise<void>
  registerMovement(data: RegisterMovementData): Promise<void>
}
