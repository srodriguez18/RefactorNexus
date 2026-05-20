import type { Product } from './Product.js'

export interface CreateProductData {
  sku: string
  name: string
  description?: string
  price: number
  category?: string
  supplierId?: number
}

export interface IProductRepository {
  list(): Promise<Product[]>
  findById(id: number): Promise<Product | null>
  findBySku(sku: string): Promise<Product | null>
  search(term: string): Promise<Product[]>
  create(data: CreateProductData): Promise<Product>
  delete(id: number): Promise<void>
}
