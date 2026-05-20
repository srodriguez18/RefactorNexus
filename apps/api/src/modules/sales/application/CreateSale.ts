import { calculateSaleTotal } from '@legacy-nexus/finance'
import type { SaleSummary } from '@legacy-nexus/shared'
import type { IProductRepository } from '../../catalog/domain/IProductRepository.js'
import type { IInventoryRepository } from '../../inventory/domain/IInventoryRepository.js'
import type { ISaleRepository } from '../domain/ISaleRepository.js'

export interface CreateSaleParams {
  userId: number
  customerType: 'NORMAL' | 'LEGACY_A'
  items: Array<{ productId: number; quantity: number }>
}

// Sprint 1: stock is decremented from the default (Centro) warehouse.
const DEFAULT_WAREHOUSE_ID = 1

export class CreateSale {
  constructor(
    private readonly saleRepo: ISaleRepository,
    private readonly productRepo: IProductRepository,
    private readonly inventoryRepo: IInventoryRepository,
  ) {}

  async execute(params: CreateSaleParams): Promise<SaleSummary> {
    const { userId, customerType, items } = params

    // 1. Resolve current prices — unit price is frozen as snapshot at sale time
    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await this.productRepo.findById(item.productId)
        if (!product || !product.isActive()) {
          throw new Error(`Producto ${item.productId} no disponible`)
        }
        return { productId: item.productId, quantity: item.quantity, unitPrice: product.price }
      }),
    )

    // 2. Verify stock for all items before persisting anything (all-or-nothing)
    for (const item of enriched) {
      const available = await this.inventoryRepo.getStock(item.productId)
      if (available < item.quantity) {
        throw new Error(`Stock insuficiente para producto ${item.productId}`)
      }
    }

    // 3. Calculate totals via finance package — eliminates legacy discount duplication
    const { subtotal, discount, total } = calculateSaleTotal({ items: enriched, customerType })

    // 4. Persist sale with frozen unit prices
    const sale = await this.saleRepo.create({
      userId,
      customerType,
      subtotal,
      discount,
      total,
      items: enriched,
    })

    // 5. Decrement stock per item
    for (const item of enriched) {
      await this.inventoryRepo.decrement(item.productId, DEFAULT_WAREHOUSE_ID, item.quantity)
    }

    return {
      id: sale.id,
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      status: sale.status,
      items: sale.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    }
  }
}
