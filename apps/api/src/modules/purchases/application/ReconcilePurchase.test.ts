import { describe, test, expect, vi, beforeEach } from 'vitest'
import { ReconcilePurchase } from './ReconcilePurchase.js'
import { AppError } from '../../../lib/AppError.js'

const mockRepo = { findById: vi.fn(), reconcile: vi.fn() }

beforeEach(() => vi.clearAllMocks())

const makePurchase = (status: string) => ({
  id: 1,
  supplierId: 1,
  total: 5000,
  status,
  bankRef: null,
  items: [],
  receivedDate: new Date(),
})

describe('ReconcilePurchase', () => {
  const uc = new ReconcilePurchase(mockRepo as any)

  test('lanza AppError 404 si la compra no existe', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(uc.execute({ purchaseId: 99, bankRef: 'REF-001' })).rejects.toMatchObject({ statusCode: 404 })
  })

  test('lanza AppError 400 si la compra ya fue reconciliada', async () => {
    mockRepo.findById.mockResolvedValue(makePurchase('reconciled'))
    await expect(uc.execute({ purchaseId: 1, bankRef: 'REF-001' })).rejects.toMatchObject({ statusCode: 400 })
  })

  test('reconcilia la compra y retorna el resultado', async () => {
    const reconciled = makePurchase('reconciled')
    mockRepo.findById.mockResolvedValue(makePurchase('received'))
    mockRepo.reconcile.mockResolvedValue(reconciled)

    const result = await uc.execute({ purchaseId: 1, bankRef: 'REF-001' })

    expect(mockRepo.reconcile).toHaveBeenCalledWith(1, 'REF-001')
    expect(result).toBe(reconciled)
  })

  test('reconcilia una compra en estado pending', async () => {
    mockRepo.findById.mockResolvedValue(makePurchase('pending'))
    mockRepo.reconcile.mockResolvedValue(makePurchase('reconciled'))

    await expect(uc.execute({ purchaseId: 1, bankRef: 'REF-002' })).resolves.toBeDefined()
  })
})
