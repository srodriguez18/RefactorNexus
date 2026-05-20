import { describe, test, expect, vi, beforeEach } from 'vitest'
import { GetAggregateTotals } from './GetAggregateTotals.js'
import { AppError } from '../../../lib/AppError.js'

vi.mock('@legacy-nexus/finance', () => ({
  applyVAT: (n: number) => parseFloat((n * 1.16).toFixed(2)),
}))

const mockRepo = { aggregateTotals: vi.fn() }

beforeEach(() => vi.clearAllMocks())

describe('GetAggregateTotals', () => {
  const uc = new GetAggregateTotals(mockRepo as any)

  test('lanza AppError 400 para customerType inválido', async () => {
    await expect(
      uc.execute({ customerType: 'PREMIUM' }),
    ).rejects.toMatchObject({ statusCode: 400 })
    await expect(
      uc.execute({ customerType: 'PREMIUM' }),
    ).rejects.toBeInstanceOf(AppError)
  })

  test('acepta customerType NORMAL', async () => {
    mockRepo.aggregateTotals.mockResolvedValue({ subtotal: 1000, vat: 0, total: 1000, count: 5 })
    await expect(uc.execute({ customerType: 'NORMAL' })).resolves.toBeDefined()
  })

  test('acepta customerType LEGACY_A', async () => {
    mockRepo.aggregateTotals.mockResolvedValue({ subtotal: 500, vat: 0, total: 500, count: 2 })
    await expect(uc.execute({ customerType: 'LEGACY_A' })).resolves.toBeDefined()
  })

  test('acepta llamada sin filtros', async () => {
    mockRepo.aggregateTotals.mockResolvedValue({ subtotal: 2000, vat: 0, total: 2000, count: 10 })
    await expect(uc.execute({})).resolves.toBeDefined()
  })

  test('deriva el VAT del subtotal usando applyVAT', async () => {
    mockRepo.aggregateTotals.mockResolvedValue({ subtotal: 1000, vat: 0, total: 1160, count: 3 })
    const result = await uc.execute({})
    expect(result.vat).toBeCloseTo(160, 1)
  })

  test('pasa year y customerType al repositorio', async () => {
    mockRepo.aggregateTotals.mockResolvedValue({ subtotal: 0, vat: 0, total: 0, count: 0 })
    await uc.execute({ year: 2026, customerType: 'NORMAL' })
    expect(mockRepo.aggregateTotals).toHaveBeenCalledWith({ year: 2026, customerType: 'NORMAL' })
  })
})
