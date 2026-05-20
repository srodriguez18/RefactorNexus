import { describe, test, expect, vi, beforeEach } from 'vitest'
import { ReturnSale } from './ReturnSale.js'
import { Sale } from '../domain/Sale.js'
import { SaleItem } from '../domain/SaleItem.js'
import { AppError } from '../../../lib/AppError.js'

const mockSaleRepo = {
  findById: vi.fn(),
  updateStatus: vi.fn(),
}
const mockInventoryRepo = {
  increment: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

const makeSale = (status: 'active' | 'returned' | 'cancelled', items: SaleItem[] = []) =>
  new Sale(1, 1, 'NORMAL', 1000, 0, 1000, status, items, new Date())

describe('ReturnSale', () => {
  const uc = new ReturnSale(mockSaleRepo as any, mockInventoryRepo as any)

  test('lanza AppError 404 si la venta no existe', async () => {
    mockSaleRepo.findById.mockResolvedValue(null)
    await expect(uc.execute(99)).rejects.toThrow(AppError)
    await expect(uc.execute(99)).rejects.toMatchObject({ statusCode: 404 })
  })

  test('lanza AppError 400 si la venta ya fue devuelta', async () => {
    mockSaleRepo.findById.mockResolvedValue(makeSale('returned'))
    await expect(uc.execute(1)).rejects.toMatchObject({ statusCode: 400 })
  })

  test('lanza AppError 400 si la venta está cancelada', async () => {
    mockSaleRepo.findById.mockResolvedValue(makeSale('cancelled'))
    await expect(uc.execute(1)).rejects.toMatchObject({ statusCode: 400 })
  })

  test('restaura stock por cada ítem y actualiza estado', async () => {
    const items = [
      new SaleItem(1, 10, 2, 100),
      new SaleItem(1, 20, 1, 200),
    ]
    const sale = makeSale('active', items)
    const updated = makeSale('returned', items)

    mockSaleRepo.findById
      .mockResolvedValueOnce(sale)
      .mockResolvedValueOnce(updated)
    mockInventoryRepo.increment.mockResolvedValue(undefined)
    mockSaleRepo.updateStatus.mockResolvedValue(undefined)

    const result = await uc.execute(1)

    expect(mockInventoryRepo.increment).toHaveBeenCalledTimes(2)
    expect(mockInventoryRepo.increment).toHaveBeenCalledWith(10, 1, 2)
    expect(mockInventoryRepo.increment).toHaveBeenCalledWith(20, 1, 1)
    expect(mockSaleRepo.updateStatus).toHaveBeenCalledWith(1, 'returned')
    expect(result.status).toBe('returned')
  })

  test('no llama a increment si la venta no tiene ítems', async () => {
    const sale = makeSale('active', [])
    const updated = makeSale('returned', [])
    mockSaleRepo.findById
      .mockResolvedValueOnce(sale)
      .mockResolvedValueOnce(updated)
    mockSaleRepo.updateStatus.mockResolvedValue(undefined)

    await uc.execute(1)
    expect(mockInventoryRepo.increment).not.toHaveBeenCalled()
  })
})
