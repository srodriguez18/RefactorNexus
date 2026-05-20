import type { IProductRepository } from '../domain/IProductRepository.js'
import type { Product } from '../domain/Product.js'

export class GetProduct {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(id: number): Promise<Product> {
    const product = await this.productRepo.findById(id)
    if (!product?.isActive()) {
      throw new Error('Producto no encontrado')
    }
    return product
  }
}
