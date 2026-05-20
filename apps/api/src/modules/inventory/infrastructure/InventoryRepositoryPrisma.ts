import type { PrismaClient } from '@prisma/client'
import type { IInventoryRepository, StockDetail, RegisterMovementData } from '../domain/IInventoryRepository.js'

export class InventoryRepositoryPrisma implements IInventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getStock(productId: number, warehouseId?: number): Promise<number> {
    if (warehouseId !== undefined) {
      const row = await this.prisma.inventoryStock.findUnique({
        where: { productId_warehouseId: { productId, warehouseId } },
      })
      return row?.quantity ?? 0
    }
    const agg = await this.prisma.inventoryStock.aggregate({
      where: { productId },
      _sum: { quantity: true },
    })
    return agg._sum.quantity ?? 0
  }

  async listStock(): Promise<StockDetail[]> {
    const rows = await this.prisma.inventoryStock.findMany({
      include: { product: true, warehouse: true },
    })
    return rows.map((r) => ({
      productId: r.productId,
      productName: r.product.name,
      warehouseId: r.warehouseId,
      warehouseName: r.warehouse.name,
      quantity: r.quantity,
    }))
  }

  // Corrige filter_by_warehouse del legacy: where parametrizado, sin concatenación de strings
  async listByWarehouse(warehouseId: number): Promise<StockDetail[]> {
    const rows = await this.prisma.inventoryStock.findMany({
      where: { warehouseId },
      include: { product: true, warehouse: true },
    })
    return rows.map((r) => ({
      productId: r.productId,
      productName: r.product.name,
      warehouseId: r.warehouseId,
      warehouseName: r.warehouse.name,
      quantity: r.quantity,
    }))
  }

  async decrement(productId: number, warehouseId: number, quantity: number): Promise<void> {
    await this.prisma.inventoryStock.update({
      where: { productId_warehouseId: { productId, warehouseId } },
      data: { quantity: { decrement: quantity } },
    })
  }

  async increment(productId: number, warehouseId: number, quantity: number): Promise<void> {
    await this.prisma.inventoryStock.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: { quantity: { increment: quantity } },
      create: { productId, warehouseId, quantity },
    })
  }

  async registerMovement(data: RegisterMovementData): Promise<void> {
    await this.prisma.inventoryMovement.create({
      data: {
        productId: data.productId,
        warehouseId: data.warehouseId,
        quantity: data.quantity,
        type: data.type,
        refId: data.refId ?? null,
      },
    })
  }
}
