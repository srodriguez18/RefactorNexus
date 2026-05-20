import type { Refund } from './Refund.js'

export interface CreateRefundData {
  saleId: number
  userId: number
  reason: string
  amount: number
}

export interface IRefundRepository {
  create(data: CreateRefundData): Promise<Refund>
  findById(id: number): Promise<Refund | null>
  listByUser(userId: number): Promise<Refund[]>
  approve(id: number, approvedBy: number): Promise<Refund>
  reject(id: number): Promise<Refund>
}
