export class InventoryStock {
  constructor(
    readonly productId: number,
    readonly warehouseId: number,
    readonly quantity: number,
  ) {}

  canDecrement(amount: number): boolean {
    return this.quantity >= amount
  }
}
