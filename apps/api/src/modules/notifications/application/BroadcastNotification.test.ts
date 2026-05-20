import { describe, test, expect, vi, beforeEach } from 'vitest'
import { BroadcastNotification } from './BroadcastNotification.js'
import { AppError } from '../../../lib/AppError.js'

const mockNotificationRepo = { createMany: vi.fn() }
const mockUserRepo = { listAllIds: vi.fn() }

beforeEach(() => vi.clearAllMocks())

describe('BroadcastNotification', () => {
  const uc = new BroadcastNotification(mockNotificationRepo as any, mockUserRepo as any)

  test('lanza AppError 400 para un tipo de notificación inválido', async () => {
    await expect(
      uc.execute({ message: 'Hola', kind: 'desconocido' }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  test.each(['info', 'warn', 'alert', 'system', 'marketing'])(
    'acepta el tipo "%s"',
    async (kind) => {
      mockUserRepo.listAllIds.mockResolvedValue([1])
      mockNotificationRepo.createMany.mockResolvedValue(1)
      await expect(uc.execute({ message: 'Msg', kind })).resolves.toBeDefined()
    },
  )

  test('retorna 0 si no hay usuarios registrados', async () => {
    mockUserRepo.listAllIds.mockResolvedValue([])
    const result = await uc.execute({ message: 'Hola', kind: 'info' })
    expect(result).toBe(0)
    expect(mockNotificationRepo.createMany).not.toHaveBeenCalled()
  })

  test('llama createMany con todos los ids y retorna el conteo', async () => {
    mockUserRepo.listAllIds.mockResolvedValue([1, 2, 3])
    mockNotificationRepo.createMany.mockResolvedValue(3)

    const result = await uc.execute({ message: 'Mensaje', kind: 'system' })

    expect(mockNotificationRepo.createMany).toHaveBeenCalledWith([1, 2, 3], 'Mensaje', 'system')
    expect(result).toBe(3)
  })
})
