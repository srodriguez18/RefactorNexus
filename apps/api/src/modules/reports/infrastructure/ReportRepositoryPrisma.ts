import type { PrismaClient } from '@prisma/client'
import type { IReportRepository, MonthlySaleRow } from '../domain/IReportRepository.js'

export class ReportRepositoryPrisma implements IReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private monthBounds(year: number, month: number): { gte: Date; lt: Date } {
    const gte = new Date(year, month - 1, 1)
    const lt = new Date(year, month, 1)
    return { gte, lt }
  }

  async monthlySales(year: number, month: number): Promise<MonthlySaleRow[]> {
    const { gte, lt } = this.monthBounds(year, month)
    const rows = await this.prisma.sale.findMany({
      where: { createdAt: { gte, lt } },
      include: {
        user: { select: { username: true } },
        items: { select: { id: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      username: r.user.username,
      subtotal: parseFloat(r.subtotal.toString()),
      discount: parseFloat(r.discount.toString()),
      total: parseFloat(r.total.toString()),
      itemCount: r.items.length,
    }))
  }

  async monthlyTotal(year: number, month: number): Promise<number> {
    const { gte, lt } = this.monthBounds(year, month)
    const agg = await this.prisma.sale.aggregate({
      where: { createdAt: { gte, lt } },
      _sum: { total: true },
    })
    return parseFloat((agg._sum.total ?? 0).toString())
  }
}
