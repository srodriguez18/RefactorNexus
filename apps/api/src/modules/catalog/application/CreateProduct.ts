import type { IProductRepository, CreateProductData } from '../domain/IProductRepository.js'
import type { Product } from '../domain/Product.js'

export class CreateProduct {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(data: CreateProductData): Promise<Product> {
    if (!data.sku.trim()) throw new Error('SKU es requerido')
    if (!data.name.trim()) throw new Error('Nombre es requerido')
    if (data.price <= 0) throw new Error('El precio debe ser mayor a 0')

    const existing = await this.productRepo.findBySku(data.sku)
    if (existing?.isActive()) throw new Error(`SKU '${data.sku}' ya existe`)

    return this.productRepo.create(data)
  }
}
