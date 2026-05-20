import type { IPurchaseRepository } from '../domain/IPurchaseRepository.js'
import type { Purchase } from '../domain/Purchase.js'
import type { IInventoryRepository } from '../../inventory/domain/IInventoryRepository.js'

const DEFAULT_WAREHOUSE_ID = 1

interface CreatePurchaseParams {
  supplierId: number
  items: Array<{ productId: number; quantity: number; unitCost: number }>
  receivedDate?: string
}

export class CreatePurchase {
  constructor(
    private readonly purchaseRepo: IPurchaseRepository,
    private readonly inventoryRepo: IInventoryRepository,
  ) {}

  async execute(params: CreatePurchaseParams): Promise<Purchase> {
    let receivedDate: Date | null = null
    if (params.receivedDate) {
      receivedDate = new Date(params.receivedDate)
      if (isNaN(receivedDate.getTime())) {
        throw new Error('Formato de fecha inválido')
      }
    }

    const total = params.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)

    const purchase = await this.purchaseRepo.create({
      supplierId: params.supplierId,
      total,
      receivedDate,
      status: receivedDate ? 'received' : 'pending',
      items: params.items,
    })

    for (const item of params.items) {
      await this.inventoryRepo.increment(item.productId, DEFAULT_WAREHOUSE_ID, item.quantity)
      await this.inventoryRepo.registerMovement({
        productId: item.productId,
        warehouseId: DEFAULT_WAREHOUSE_ID,
        quantity: item.quantity,
        type: 'IN',
        refId: purchase.id,
      })
    }

    return purchase
  }
}
