export class Product {
  constructor(
    readonly id: number,
    readonly sku: string,
    readonly name: string,
    readonly description: string | null,
    readonly price: number,
    readonly category: string | null,
    readonly supplierId: number | null,
    readonly deletedAt: Date | null,
  ) {}

  isActive(): boolean {
    return this.deletedAt === null
  }
}
