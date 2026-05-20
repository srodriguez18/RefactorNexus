import { describe, test, expect, vi, beforeEach } from 'vitest'
import { MarkAsRead } from './MarkAsRead.js'
import { AppError } from '../../../lib/AppError.js'

const mockRepo = { findById: vi.fn(), markAsRead: vi.fn() }

beforeEach(() => vi.clearAllMocks())

describe('MarkAsRead', () => {
  const uc = new MarkAsRead(mockRepo as any)

  test('lanza AppError 404 si la notificación no existe', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(uc.execute(99)).rejects.toMatchObject({ statusCode: 404 })
    await expect(uc.execute(99)).rejects.toBeInstanceOf(AppError)
  })

  test('llama markAsRead con el id correcto', async () => {
    mockRepo.findById.mockResolvedValue({ id: 5 })
    mockRepo.markAsRead.mockResolvedValue(undefined)

    await uc.execute(5)

    expect(mockRepo.markAsRead).toHaveBeenCalledWith(5)
  })

  test('no llama markAsRead si la notificación no existe', async () => {
    mockRepo.findById.mockResolvedValue(null)
    await expect(uc.execute(1)).rejects.toThrow()
    expect(mockRepo.markAsRead).not.toHaveBeenCalled()
  })
})
