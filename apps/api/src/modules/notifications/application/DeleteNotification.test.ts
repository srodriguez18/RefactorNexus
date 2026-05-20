import { describe, test, expect, vi, beforeEach } from 'vitest'
import { DeleteNotification } from './DeleteNotification.js'
import { AppError } from '../../../lib/AppError.js'

const mockRepo = { findById: vi.fn(), delete: vi.fn() }

beforeEach(() => vi.clearAllMocks())

describe('DeleteNotification', () => {
  const uc = new DeleteNotification(mockRepo as any)

  test('lanza AppError 404 si la notificación no existe', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(uc.execute(99)).rejects.toMatchObject({ statusCode: 404 })
    await expect(uc.execute(99)).rejects.toBeInstanceOf(AppError)
  })

  test('llama delete con el id correcto', async () => {
    mockRepo.findById.mockResolvedValue({ id: 7 })
    mockRepo.delete.mockResolvedValue(undefined)

    await uc.execute(7)

    expect(mockRepo.delete).toHaveBeenCalledWith(7)
  })

  test('no llama delete si la notificación no existe', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(uc.execute(1)).rejects.toThrow()
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })
})
