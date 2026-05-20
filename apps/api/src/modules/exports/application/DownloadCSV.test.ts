import { describe, test, expect, vi, beforeEach } from 'vitest'
import { DownloadCSV } from './DownloadCSV.js'
import { AppError } from '../../../lib/AppError.js'

const mockRepo = { salesForCSV: vi.fn() }

beforeEach(() => vi.clearAllMocks())

const makeRow = (overrides = {}) => ({
  id: 1,
  date: new Date('2026-05-19T14:00:00Z'),
  username: 'usuario1',
  customerType: 'NORMAL',
  subtotal: 1000,
  discount: 100,
  total: 900,
  ...overrides,
})

describe('DownloadCSV', () => {
  const uc = new DownloadCSV(mockRepo as any)

  test('lanza AppError 400 para customerType inválido', async () => {
    await expect(
      uc.execute({ customerType: 'PREMIUM' }),
    ).rejects.toMatchObject({ statusCode: 400 })
    await expect(
      uc.execute({ customerType: 'PREMIUM' }),
    ).rejects.toBeInstanceOf(AppError)
  })

  test('retorna solo el encabezado si no hay filas', async () => {
    mockRepo.salesForCSV.mockResolvedValue([])
    const result = await uc.execute({})
    expect(result).toBe('ID,Fecha,Usuario,TipoCliente,Subtotal,Descuento,Total')
  })

  test('genera CSV con cabecera y filas correctas', async () => {
    mockRepo.salesForCSV.mockResolvedValue([makeRow()])
    const result = await uc.execute({})
    const lines = result.split('\r\n')
    expect(lines[0]).toBe('ID,Fecha,Usuario,TipoCliente,Subtotal,Descuento,Total')
    expect(lines[1]).toContain('1,')
    expect(lines[1]).toContain('usuario1')
    expect(lines[1]).toContain('1000.00')
    expect(lines[1]).toContain('900.00')
  })

  test('escapa username con comas entre comillas dobles', async () => {
    mockRepo.salesForCSV.mockResolvedValue([makeRow({ username: 'García, Juan' })])
    const result = await uc.execute({})
    expect(result).toContain('"García, Juan"')
  })

  test('escapa username con comillas duplicando el carácter', async () => {
    mockRepo.salesForCSV.mockResolvedValue([makeRow({ username: 'O"Brien' })])
    const result = await uc.execute({})
    expect(result).toContain('"O""Brien"')
  })

  test('usa separador CRLF entre líneas', async () => {
    mockRepo.salesForCSV.mockResolvedValue([makeRow()])
    const result = await uc.execute({})
    expect(result).toContain('\r\n')
  })

  test('pasa year y month al repositorio', async () => {
    mockRepo.salesForCSV.mockResolvedValue([])
    await uc.execute({ year: 2026, month: 5, customerType: 'NORMAL' })
    expect(mockRepo.salesForCSV).toHaveBeenCalledWith({ year: 2026, month: 5, customerType: 'NORMAL' })
  })
})
