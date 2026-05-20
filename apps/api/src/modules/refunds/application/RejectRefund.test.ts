import { describe, test, expect, vi, beforeEach } from 'vitest'
import { RejectRefund } from './RejectRefund.js'
import { Refund } from '../domain/Refund.js'
import { AppError } from '../../../lib/AppError.js'

const mockRepo = { findById: vi.fn(), reject: vi.fn() }

beforeEach(() => vi.clearAllMocks())

const makeRefund = (status: 'pending' | 'approved' | 'rejected') =>
  new Refund(1, 10, 1, 'Motivo', 500, status, null, new Date())

describe('RejectRefund', () => {
  const uc = new RejectRefund(mockRepo as any)

  test('lanza AppError 404 si el reembolso no existe', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(uc.execute({ refundId: 99 })).rejects.toMatchObject({ statusCode: 404 })
  })

  test('lanza AppError 400 si el reembolso ya fue rechazado', async () => {
    mockRepo.findById.mockResolvedValue(makeRefund('rejected'))
    await expect(uc.execute({ refundId: 1 })).rejects.toMatchObject({ statusCode: 400 })
  })

  test('lanza AppError 400 si el reembolso ya fue aprobado', async () => {
    mockRepo.findById.mockResolvedValue(makeRefund('approved'))
    await expect(uc.execute({ refundId: 1 })).rejects.toMatchObject({ statusCode: 400 })
  })

  test('rechaza el reembolso pendiente y retorna el resultado', async () => {
    const rejected = makeRefund('rejected')
    mockRepo.findById.mockResolvedValue(makeRefund('pending'))
    mockRepo.reject.mockResolvedValue(rejected)

    const result = await uc.execute({ refundId: 1 })

    expect(mockRepo.reject).toHaveBeenCalledWith(1)
    expect(result).toBe(rejected)
  })
})
