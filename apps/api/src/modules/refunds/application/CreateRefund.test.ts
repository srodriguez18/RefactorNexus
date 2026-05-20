import { describe, test, expect, vi, beforeEach } from 'vitest'
import { CreateRefund } from './CreateRefund.js'
import { Sale } from '../../sales/domain/Sale.js'
import { SaleItem } from '../../sales/domain/SaleItem.js'
import { AppError } from '../../../lib/AppError.js'

vi.mock('@legacy-nexus/finance', () => ({
  applyVAT: (n: number) => parseFloat((n * 1.16).toFixed(2)),
}))

const mockRefundRepo = { create: vi.fn() }
const mockSaleRepo = { findById: vi.fn() }

beforeEach(() => vi.clearAllMocks())

const makeSale = (items: SaleItem[]) =>
  new Sale(1, 1, 'NORMAL', 0, 0, 0, 'active', items, new Date())

describe('CreateRefund', () => {
  const uc = new CreateRefund(mockRefundRepo as any, mockSaleRepo as any)

  test('lanza AppError 404 si la venta no existe', async () => {
    mockSaleRepo.findById.mockResolvedValue(null)
    await expect(uc.execute({ saleId: 99, userId: 1, reason: 'test' })).rejects.toThrow(AppError)
    await expect(uc.execute({ saleId: 99, userId: 1, reason: 'test' })).rejects.toMatchObject({ statusCode: 404 })
  })

  test('calcula el monto con applyVAT sobre el subtotal de los ítems', async () => {
    const items = [new SaleItem(1, 10, 2, 500)]
    mockSaleRepo.findById.mockResolvedValue(makeSale(items))
    mockRefundRepo.create.mockResolvedValue({ id: 1 })

    await uc.execute({ saleId: 1, userId: 1, reason: 'Dañado' })

    expect(mockRefundRepo.create).toHaveBeenCalledWith({
      saleId: 1,
      userId: 1,
      reason: 'Dañado',
      amount: 1160,
    })
  })

  test('devuelve el reembolso creado por el repositorio', async () => {
    const items = [new SaleItem(1, 10, 1, 100)]
    const refund = { id: 5, amount: 116 }
    mockSaleRepo.findById.mockResolvedValue(makeSale(items))
    mockRefundRepo.create.mockResolvedValue(refund)

    const result = await uc.execute({ saleId: 1, userId: 2, reason: 'Error' })
    expect(result).toBe(refund)
  })
})
