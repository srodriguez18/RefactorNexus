export type LoginRequest = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  user: { id: number; username: string; isAdmin: boolean }
}

export type TokenPayload = {
  userId: number
  username: string
  isAdmin: boolean
}

export type Product = {
  id: number
  sku: string
  name: string
  description: string | null
  price: number
  category: string | null
  supplierId: number | null
}

export type CreateProductDto = {
  sku: string
  name: string
  description?: string
  price: number
  category?: string
  supplierId?: number
}

export type InventoryStock = {
  productId: number
  productName: string
  warehouseId: number
  warehouseName: string
  quantity: number
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT'

export type AdjustStockDto = {
  productId: number
  warehouseId: number
  quantity: number
  type: MovementType
}

export type SaleItemDto = {
  productId: number
  quantity: number
}

export type CreateSaleDto = {
  customerType: 'NORMAL' | 'LEGACY_A'
  items: SaleItemDto[]
}

export type SaleSummary = {
  id: number
  subtotal: number
  discount: number
  total: number
  status: string
  items: Array<{
    productId: number
    quantity: number
    unitPrice: number
  }>
}
