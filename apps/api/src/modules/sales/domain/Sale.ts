import type { SaleItem } from './SaleItem.js'

export type SaleStatus = 'active' | 'returned' | 'cancelled'

export class Sale {
  constructor(
    readonly id: number,
    readonly userId: number,
    readonly customerType: 'NORMAL' | 'LEGACY_A',
    readonly subtotal: number,
    readonly discount: number,
    readonly total: number,
    readonly status: SaleStatus,
    readonly items: SaleItem[],
    readonly createdAt: Date,
  ) {}

  isReturnable(): boolean {
    return this.status === 'active'
  }
}
