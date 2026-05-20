import { describe, test, expect, vi, beforeEach } from 'vitest'
import { ApproveRefund } from './ApproveRefund.js'
import { Refund } from '../domain/Refund.js'
import { AppError } from '../../../lib/AppError.js'

const mockRepo = { findById: vi.fn(), approve: vi.fn() }

beforeEach(() => vi.clearAllMocks())

const makeRefund = (status: 'pending' | 'approved' | 'rejected') =>
  new Refund(1, 10, 1, 'Motivo', 500, status, null, new Date())

describe('ApproveRefund', () => {
  const uc = new ApproveRefund(mockRepo as any)

  test('lanza AppError 404 si el reembolso no existe', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(uc.execute({ refundId: 99, approvedBy: 1 })).rejects.toMatchObject({ statusCode: 404 })
  })

  test('lanza AppError 400 si el reembolso ya fue aprobado', async () => {
    mockRepo.findById.mockResolvedValue(makeRefund('approved'))
    await expect(uc.execute({ refundId: 1, approvedBy: 1 })).rejects.toMatchObject({ statusCode: 400 })
  })

  test('lanza AppError 400 si el reembolso fue rechazado', async () => {
    mockRepo.findById.mockResolvedValue(makeRefund('rejected'))
    await expect(uc.execute({ refundId: 1, approvedBy: 1 })).rejects.toMatchObject({ statusCode: 400 })
  })

  test('aprueba el reembolso pendiente y retorna el resultado', async () => {
    const approved = makeRefund('approved')
    mockRepo.findById.mockResolvedValue(makeRefund('pending'))
    mockRepo.approve.mockResolvedValue(approved)

    const result = await uc.execute({ refundId: 1, approvedBy: 2 })

    expect(mockRepo.approve).toHaveBeenCalledWith(1, 2)
    expect(result).toBe(approved)
  })

  test('el mensaje de error incluye el status actual', async () => {
    mockRepo.findById.mockResolvedValue(makeRefund('approved'))
    await expect(uc.execute({ refundId: 1, approvedBy: 1 })).rejects.toThrow("'approved'")
  })
})
