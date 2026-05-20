import type { PrismaClient } from '@prisma/client'
import { Product } from '../domain/Product.js'
import type { IProductRepository, CreateProductData } from '../domain/IProductRepository.js'

type PrismaRow = {
  id: number
  sku: string
  name: string
  description: string | null
  price: { toString(): string }
  category: string | null
  supplierId: number | null
  deletedAt: Date | null
}

function toProduct(row: PrismaRow): Product {
  return new Product(
    row.id,
    row.sku,
    row.name,
    row.description,
    parseFloat(row.price.toString()),
    row.category,
    row.supplierId,
    row.deletedAt,
  )
}

export class ProductRepositoryPrisma implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({ where: { deletedAt: null } })
    return rows.map(toProduct)
  }

  async findById(id: number): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } })
    return row ? toProduct(row) : null
  }

  async findBySku(sku: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { sku } })
    return row ? toProduct(row) : null
  }

  // Corrige SQL injection del legacy: usa contains de Prisma en lugar de concatenación
  async search(term: string): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      where: { name: { contains: term }, deletedAt: null },
    })
    return rows.map(toProduct)
  }

  async create(data: CreateProductData): Promise<Product> {
    const row = await this.prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        category: data.category ?? null,
        supplierId: data.supplierId ?? null,
      },
    })
    return toProduct(row)
  }

  // Soft-delete: setea deletedAt en lugar de borrar el registro
  async delete(id: number): Promise<void> {
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
