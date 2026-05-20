import type { Purchase, PurchaseStatus } from './Purchase.js'

export interface CreatePurchaseItemData {
  productId: number
  quantity: number
  unitCost: number
}

export interface CreatePurchaseData {
  supplierId: number
  total: number
  receivedDate: Date | null
  status: PurchaseStatus
  items: CreatePurchaseItemData[]
}

export interface Supplier {
  id: number
  name: string
  contact: string | null
  country: string | null
}

export interface IPurchaseRepository {
  create(data: CreatePurchaseData): Promise<Purchase>
  findById(id: number): Promise<Purchase | null>
  list(): Promise<Purchase[]>
  reconcile(id: number, bankRef: string): Promise<Purchase>
  listSuppliers(): Promise<Supplier[]>
}
