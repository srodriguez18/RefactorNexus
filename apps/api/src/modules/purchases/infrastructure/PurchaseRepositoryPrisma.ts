import type { PrismaClient } from '@prisma/client'
import type { IPurchaseRepository, CreatePurchaseData, Supplier } from '../domain/IPurchaseRepository.js'
import { Purchase } from '../domain/Purchase.js'
import { PurchaseItem } from '../domain/PurchaseItem.js'
import type { PurchaseStatus } from '../domain/Purchase.js'

type PurchaseRow = Awaited<ReturnType<PrismaClient['purchase']['findUniqueOrThrow']>> & {
  supplier: { id: number; name: string }
  items: Awaited<ReturnType<PrismaClient['purchaseItem']['findMany']>>
}

export class PurchaseRepositoryPrisma implements IPurchaseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapRow(row: PurchaseRow): Purchase {
    return new Purchase(
      row.id,
      row.supplierId,
      row.supplier.name,
      parseFloat(row.total.toString()),
      row.receivedDate,
      row.bankRef,
      row.status as PurchaseStatus,
      row.items.map(
        (i) => new PurchaseItem(i.purchaseId, i.productId, i.quantity, parseFloat(i.unitCost.toString())),
      ),
    )
  }

  async create(data: CreatePurchaseData): Promise<Purchase> {
    const row = await this.prisma.purchase.create({
      data: {
        supplierId: data.supplierId,
        total: data.total,
        receivedDate: data.receivedDate,
        status: data.status,
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitCost: i.unitCost,
          })),
        },
      },
      include: { supplier: true, items: true },
    })
    return this.mapRow(row)
  }

  async findById(id: number): Promise<Purchase | null> {
    const row = await this.prisma.purchase.findUnique({
      where: { id },
      include: { supplier: true, items: true },
    })
    return row ? this.mapRow(row) : null
  }

  async list(): Promise<Purchase[]> {
    const rows = await this.prisma.purchase.findMany({
      include: { supplier: true, items: true },
      orderBy: { id: 'desc' },
      take: 50,
    })
    return rows.map((r) => this.mapRow(r))
  }

  async reconcile(id: number, bankRef: string): Promise<Purchase> {
    const row = await this.prisma.purchase.update({
      where: { id },
      data: { bankRef, status: 'reconciled' },
      include: { supplier: true, items: true },
    })
    return this.mapRow(row)
  }

  async listSuppliers(): Promise<Supplier[]> {
    const rows = await this.prisma.supplier.findMany({ orderBy: { name: 'asc' } })
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      contact: r.contact,
      country: r.country,
    }))
  }
}
