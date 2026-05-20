import { describe, test, expect, vi, beforeEach } from 'vitest'
import { AdjustStock } from './AdjustStock.js'

const mockRepo = {
  getStock: vi.fn(),
  decrement: vi.fn(),
  increment: vi.fn(),
  registerMovement: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('AdjustStock', () => {
  const uc = new AdjustStock(mockRepo as any)

  test('tipo IN incrementa el stock y registra movimiento', async () => {
    mockRepo.increment.mockResolvedValue(undefined)
    mockRepo.registerMovement.mockResolvedValue(undefined)

    await uc.execute({ productId: 1, warehouseId: 1, quantity: 5, type: 'IN' })

    expect(mockRepo.increment).toHaveBeenCalledWith(1, 1, 5)
    expect(mockRepo.registerMovement).toHaveBeenCalledWith({ productId: 1, warehouseId: 1, quantity: 5, type: 'IN' })
    expect(mockRepo.decrement).not.toHaveBeenCalled()
  })

  test('tipo OUT con stock suficiente decrementa y registra movimiento', async () => {
    mockRepo.getStock.mockResolvedValue(10)
    mockRepo.decrement.mockResolvedValue(undefined)
    mockRepo.registerMovement.mockResolvedValue(undefined)

    await uc.execute({ productId: 1, warehouseId: 1, quantity: 3, type: 'OUT' })

    expect(mockRepo.decrement).toHaveBeenCalledWith(1, 1, 3)
    expect(mockRepo.registerMovement).toHaveBeenCalledWith({ productId: 1, warehouseId: 1, quantity: 3, type: 'OUT' })
  })

  test('tipo OUT con stock insuficiente lanza error', async () => {
    mockRepo.getStock.mockResolvedValue(2)

    await expect(
      uc.execute({ productId: 1, warehouseId: 1, quantity: 5, type: 'OUT' }),
    ).rejects.toThrow('Stock insuficiente')

    expect(mockRepo.decrement).not.toHaveBeenCalled()
    expect(mockRepo.registerMovement).not.toHaveBeenCalled()
  })

  test('tipo OUT con stock exacto al requerido permite la operación', async () => {
    mockRepo.getStock.mockResolvedValue(5)
    mockRepo.decrement.mockResolvedValue(undefined)
    mockRepo.registerMovement.mockResolvedValue(undefined)

    await expect(
      uc.execute({ productId: 1, warehouseId: 1, quantity: 5, type: 'OUT' }),
    ).resolves.toBeUndefined()
  })
})
