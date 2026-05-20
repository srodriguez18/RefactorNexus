import type { Sale } from '../domain/Sale.js'
import type { ISaleRepository } from '../domain/ISaleRepository.js'
import type { IInventoryRepository } from '../../inventory/domain/IInventoryRepository.js'

const DEFAULT_WAREHOUSE_ID = 1

export class ReturnSale {
  constructor(
    private readonly saleRepo: ISaleRepository,
    private readonly inventoryRepo: IInventoryRepository,
  ) {}

  async execute(saleId: number): Promise<Sale> {
    const sale = await this.saleRepo.findById(saleId)

    if (!sale) {
      throw new Error('Venta no encontrada')
    }
    if (!sale.isReturnable()) {
      throw new Error(`La venta ya tiene status '${sale.status}' y no puede devolverse`)
    }

    // Restore stock for every item before updating status
    for (const item of sale.items) {
      await this.inventoryRepo.increment(item.productId, DEFAULT_WAREHOUSE_ID, item.quantity)
    }

    await this.saleRepo.updateStatus(saleId, 'returned')

    // Return updated sale — corrects legacy bug where return_sale didn't update status
    return (await this.saleRepo.findById(saleId)) as Sale
  }
}
