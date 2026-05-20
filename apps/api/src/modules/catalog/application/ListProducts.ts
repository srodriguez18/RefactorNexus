import type { IProductRepository } from '../domain/IProductRepository.js'
import type { Product } from '../domain/Product.js'

export class ListProducts {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(): Promise<Product[]> {
    return this.productRepo.list()
  }
}
