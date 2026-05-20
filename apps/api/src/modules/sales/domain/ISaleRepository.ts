import type { Sale } from './Sale.js'

export interface CreateSaleData {
  userId: number
  customerType: 'NORMAL' | 'LEGACY_A'
  subtotal: number
  discount: number
  total: number
  items: Array<{ productId: number; quantity: number; unitPrice: number }>
}

export interface ISaleRepository {
  create(data: CreateSaleData): Promise<Sale>
  findById(id: number): Promise<Sale | null>
  listByUser(userId: number): Promise<Sale[]>
  updateStatus(id: number, status: string): Promise<void>
}
