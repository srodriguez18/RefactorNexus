import type { PrismaClient } from '@prisma/client'
import type { IRefundRepository, CreateRefundData } from '../domain/IRefundRepository.js'
import { Refund } from '../domain/Refund.js'
import type { RefundStatus } from '../domain/Refund.js'

type RefundRow = Awaited<ReturnType<PrismaClient['refund']['findUniqueOrThrow']>>

export class RefundRepositoryPrisma implements IRefundRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapRow(row: RefundRow): Refund {
    return new Refund(
      row.id,
      row.saleId,
      row.userId,
      row.reason,
      parseFloat(row.amount.toString()),
      row.status as RefundStatus,
      row.approvedBy,
      row.createdAt,
    )
  }

  async create(data: CreateRefundData): Promise<Refund> {
    const row = await this.prisma.refund.create({ data })
    return this.mapRow(row)
  }

  async findById(id: number): Promise<Refund | null> {
    const row = await this.prisma.refund.findUnique({ where: { id } })
    return row ? this.mapRow(row) : null
  }

  async listByUser(userId: number): Promise<Refund[]> {
    const rows = await this.prisma.refund.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((r) => this.mapRow(r))
  }

  async approve(id: number, approvedBy: number): Promise<Refund> {
    const row = await this.prisma.refund.update({
      where: { id },
      data: { status: 'approved', approvedBy },
    })
    return this.mapRow(row)
  }

  async reject(id: number): Promise<Refund> {
    const row = await this.prisma.refund.update({
      where: { id },
      data: { status: 'rejected' },
    })
    return this.mapRow(row)
  }
}
