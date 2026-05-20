import { describe, test, expect, vi, beforeEach } from 'vitest'
import { GetPivotReport } from './GetPivotReport.js'
import { AppError } from '../../../lib/AppError.js'

const mockRepo = { pivotData: vi.fn() }

beforeEach(() => vi.clearAllMocks())

describe('GetPivotReport', () => {
  const uc = new GetPivotReport(mockRepo as any)

  test('lanza AppError 400 para rowDim inválido', async () => {
    await expect(
      uc.execute({ year: 2026, rowDim: 'invalido', colDim: 'category' }),
    ).rejects.toMatchObject({ statusCode: 400, message: 'Dimensión de fila inválida' })
  })

  test('lanza AppError 400 para colDim inválido', async () => {
    await expect(
      uc.execute({ year: 2026, rowDim: 'customerType', colDim: 'invalido' }),
    ).rejects.toMatchObject({ statusCode: 400, message: 'Dimensión de columna inválida' })
  })

  test.each([
    ['customerType', 'category'],
    ['status', 'supplierId'],
    ['userId', 'warehouseId'],
  ])('acepta rowDim "%s" con colDim "%s"', async (rowDim, colDim) => {
    mockRepo.pivotData.mockResolvedValue([])
    await expect(uc.execute({ year: 2026, rowDim, colDim })).resolves.toEqual([])
  })

  test('pasa los parámetros al repositorio y retorna los datos', async () => {
    const rows = [{ rowLabel: 'NORMAL', colLabel: 'cat', total: 1000, count: 5 }]
    mockRepo.pivotData.mockResolvedValue(rows)

    const result = await uc.execute({ year: 2026, rowDim: 'customerType', colDim: 'category' })

    expect(mockRepo.pivotData).toHaveBeenCalledWith({
      year: 2026,
      rowDim: 'customerType',
      colDim: 'category',
    })
    expect(result).toBe(rows)
  })
})
