import type { PrismaClient } from '@prisma/client'
import type { ISaleRepository, CreateSaleData } from '../domain/ISaleRepository.js'
import { Sale } from '../domain/Sale.js'
import { SaleItem } from '../domain/SaleItem.js'

type SaleWithItems = Awaited<
  ReturnType<PrismaClient['sale']['findUniqueOrThrow']>
> & { items: Awaited<ReturnType<PrismaClient['saleItem']['findMany']>> }

export class SaleRepositoryPrisma implements ISaleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapRow(row: SaleWithItems): Sale {
    return new Sale(
      row.id,
      row.userId,
      row.customerType as 'NORMAL' | 'LEGACY_A',
      parseFloat(row.subtotal.toString()),
      parseFloat(row.discount.toString()),
      parseFloat(row.total.toString()),
      row.status as 'active' | 'returned' | 'cancelled',
      row.items.map(
        (i) =>
          new SaleItem(
            i.saleId,
            i.productId,
            i.quantity,
            parseFloat(i.unitPrice.toString()),
          ),
      ),
      row.createdAt,
    )
  }

  async create(data: CreateSaleData): Promise<Sale> {
    const row = await this.prisma.sale.create({
      data: {
        userId: data.userId,
        customerType: data.customerType,
        subtotal: data.subtotal,
        discount: data.discount,
        total: data.total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    })
    return this.mapRow(row)
  }

  async findById(id: number): Promise<Sale | null> {
    const row = await this.prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    })
    return row ? this.mapRow(row) : null
  }

  // Corrige get_sales_by_user del legacy: where parametrizado, sin concatenación
  async listByUser(userId: number): Promise<Sale[]> {
    const rows = await this.prisma.sale.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((r) => this.mapRow(r))
  }

  async updateStatus(id: number, status: string): Promise<void> {
    await this.prisma.sale.update({
      where: { id },
      data: { status },
    })
  }
}
