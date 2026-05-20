import type { IProductRepository } from '../domain/IProductRepository.js'
import type { Product } from '../domain/Product.js'

export class SearchProducts {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(term: string): Promise<Product[]> {
    return this.productRepo.search(term)
  }
}
