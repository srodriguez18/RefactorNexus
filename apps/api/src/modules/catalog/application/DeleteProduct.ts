import type { IProductRepository } from '../domain/IProductRepository.js'

export class DeleteProduct {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(id: number): Promise<void> {
    const product = await this.productRepo.findById(id)
    if (!product?.isActive()) {
      throw new Error('Producto no encontrado')
    }
    await this.productRepo.delete(id)
  }
}
