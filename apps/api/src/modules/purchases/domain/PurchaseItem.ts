export class PurchaseItem {
  constructor(
    readonly purchaseId: number,
    readonly productId: number,
    readonly quantity: number,
    readonly unitCost: number,
  ) {}
}
