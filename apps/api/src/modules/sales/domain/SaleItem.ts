export class SaleItem {
  constructor(
    readonly saleId: number,
    readonly productId: number,
    readonly quantity: number,
    readonly unitPrice: number,
  ) {}
}
