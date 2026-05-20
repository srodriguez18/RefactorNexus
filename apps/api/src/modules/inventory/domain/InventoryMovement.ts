export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT'

export interface InventoryMovement {
  id: number
  productId: number
  warehouseId: number
  quantity: number
  type: MovementType
  refId: number | null
  createdAt: Date
}
