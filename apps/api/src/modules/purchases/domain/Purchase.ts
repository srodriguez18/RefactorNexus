import type { PurchaseItem } from './PurchaseItem.js'

export type PurchaseStatus = 'pending' | 'received' | 'reconciled'

export class Purchase {
  constructor(
    readonly id: number,
    readonly supplierId: number,
    readonly supplierName: string,
    readonly total: number,
    readonly receivedDate: Date | null,
    readonly bankRef: string | null,
    readonly status: PurchaseStatus,
    readonly items: PurchaseItem[],
  ) {}
}
