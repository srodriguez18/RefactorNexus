import { Prisma, type PrismaClient } from '@prisma/client'
import type {
  IExportRepository,
  PivotParams,
  TotalsParams,
  CSVParams,
  PivotRow,
  AggregateTotals,
  SaleCSVRow,
} from '../domain/IExportRepository.js'
import type { RowDimension, ColDimension } from '../domain/PivotDimension.js'

type SaleWithPivotData = Awaited<ReturnType<PrismaClient['sale']['findMany']>>[number] & {
  items: Array<{
    quantity: number
    unitPrice: Prisma.Decimal
    product: { category: string | null; supplierId: number | null }
  }>
}

export class ExportRepositoryPrisma implements IExportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private yearBounds(year: number): { gte: Date; lt: Date } {
    return { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }
  }

  private getRowLabel(sale: SaleWithPivotData, dim: RowDimension): string {
    switch (dim) {
      case 'customerType': return sale.customerType
      case 'status':       return sale.status
      case 'userId':       return `Usuario ${sale.userId}`
    }
  }

  private getColLabel(
    item: SaleWithPivotData['items'][number],
    dim: ColDimension,
  ): string {
    switch (dim) {
      case 'category':    return item.product.category ?? 'Sin categoría'
      case 'supplierId':  return item.product.supplierId !== null
                            ? `Proveedor ${item.product.supplierId}`
                            : 'Sin proveedor'
      case 'warehouseId': return 'Almacén 1'
    }
  }

  async pivotData(params: PivotParams): Promise<PivotRow[]> {
    const { gte, lt } = this.yearBounds(params.year)
    const sales = await this.prisma.sale.findMany({
      where: { createdAt: { gte, lt } },
      include: {
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            product: { select: { category: true, supplierId: true } },
          },
        },
      },
    })

    const groups = new Map<string, { rowLabel: string; colLabel: string; total: number; count: number }>()

    for (const sale of sales) {
      const rowLabel = this.getRowLabel(sale as SaleWithPivotData, params.rowDim)
      for (const item of (sale as SaleWithPivotData).items) {
        const colLabel = this.getColLabel(item, params.colDim)
        const key = `${rowLabel}\x00${colLabel}`
        const lineTotal = item.quantity * parseFloat(item.unitPrice.toString())
        const existing = groups.get(key)
        if (existing) {
          existing.total += lineTotal
          existing.count += 1
        } else {
          groups.set(key, { rowLabel, colLabel, total: lineTotal, count: 1 })
        }
      }
    }

    return Array.from(groups.values()).map((g) => ({
      ...g,
      total: parseFloat(g.total.toFixed(2)),
    }))
  }

  async aggregateTotals(params: TotalsParams): Promise<AggregateTotals> {
    const where: Prisma.SaleWhereInput = {}
    if (params.year !== undefined) {
      where.createdAt = this.yearBounds(params.year)
    }
    if (params.customerType !== undefined) {
      where.customerType = params.customerType
    }

    const agg = await this.prisma.sale.aggregate({
      where,
      _sum: { subtotal: true, total: true },
      _count: { id: true },
    })

    const subtotal = parseFloat((agg._sum.subtotal ?? 0).toString())
    const total    = parseFloat((agg._sum.total    ?? 0).toString())
    const count    = agg._count.id

    // vat is filled in by the application layer using applyVAT
    return { subtotal, vat: 0, total, count }
  }

  async salesForCSV(params: CSVParams): Promise<SaleCSVRow[]> {
    const where: Prisma.SaleWhereInput = {}

    if (params.year !== undefined) {
      const gte = new Date(params.year, params.month !== undefined ? params.month - 1 : 0, 1)
      const lt  = params.month !== undefined
        ? new Date(params.year, params.month, 1)
        : new Date(params.year + 1, 0, 1)
      where.createdAt = { gte, lt }
    }
    if (params.customerType !== undefined) {
      where.customerType = params.customerType
    }

    const rows = await this.prisma.sale.findMany({
      where,
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return rows.map((r) => ({
      id:           r.id,
      date:         r.createdAt,
      username:     r.user.username,
      customerType: r.customerType,
      subtotal:     parseFloat(r.subtotal.toString()),
      discount:     parseFloat(r.discount.toString()),
      total:        parseFloat(r.total.toString()),
    }))
  }
}
