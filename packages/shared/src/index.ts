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

export type RefundStatus = 'pending' | 'approved' | 'rejected'
export type Refund = {
  id: number
  saleId: number
  userId: number
  reason: string
  amount: number
  status: RefundStatus
  approvedBy: number | null
  createdAt: string
}
export type CreateRefundDto = {
  saleId: number
  reason: string
}

export type PurchaseStatus = 'pending' | 'received' | 'reconciled'
export type PurchaseItemDto = {
  productId: number
  quantity: number
  unitCost: number
}
export type CreatePurchaseDto = {
  supplierId: number
  items: PurchaseItemDto[]
  receivedDate?: string
}
export type ReconcileDto = {
  bankRef: string
}
export type Purchase = {
  id: number
  supplierId: number
  supplierName: string
  total: number
  receivedDate: string | null
  bankRef: string | null
  status: PurchaseStatus
}
export type Supplier = {
  id: number
  name: string
  contact: string | null
  country: string | null
}

export type NotificationKind = 'info' | 'warn' | 'alert' | 'system' | 'marketing'
export type NotificationStatus = 'unread' | 'read'
export type Notification = {
  id: number
  userId: number
  message: string
  kind: NotificationKind
  status: NotificationStatus
  createdAt: string
}
export type CreateNotificationDto = {
  userId: number
  message: string
  kind: NotificationKind
}
export type BroadcastNotificationDto = {
  message: string
  kind: NotificationKind
}

export type SaleRecord = {
  id: number
  userId: number
  customerType: 'NORMAL' | 'LEGACY_A'
  subtotal: number
  discount: number
  total: number
  status: string
  createdAt: string
  items: Array<{
    saleId: number
    productId: number
    quantity: number
    unitPrice: number
  }>
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
