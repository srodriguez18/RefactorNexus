import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MonthlyReportTable } from './MonthlyReportTable'
import type { MonthlySaleRow } from '@legacy-nexus/shared'

const makeRow = (overrides: Partial<MonthlySaleRow> = {}): MonthlySaleRow => ({
  id: 1,
  username: 'usuario1',
  subtotal: 1000,
  discount: 100,
  total: 900,
  itemCount: 3,
  createdAt: '2026-05-19T14:00:00Z',
  ...overrides,
})

const baseProps = {
  rows: [],
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
}

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

describe('MonthlyReportTable', () => {
  test('muestra estado de carga', () => {
    render(<MonthlyReportTable {...baseProps} isLoading />)
    expect(screen.getByText(/cargando reporte/i)).toBeInTheDocument()
  })

  test('muestra error con botón reintentar', async () => {
    const onRetry = vi.fn()
    render(<MonthlyReportTable {...baseProps} isError onRetry={onRetry} />)
    expect(screen.getByText(/error al cargar reporte/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  test('muestra mensaje cuando no hay ventas', () => {
    render(<MonthlyReportTable {...baseProps} />)
    expect(screen.getByText(/no hay ventas en este período/i)).toBeInTheDocument()
  })

  test('renderiza fila con id, usuario y montos formateados', () => {
    render(<MonthlyReportTable {...baseProps} rows={[makeRow()]} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('usuario1')).toBeInTheDocument()
    expect(screen.getAllByText(fmt.format(1000)).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(fmt.format(900)).length).toBeGreaterThanOrEqual(1)
  })

  test('muestra descuento con signo menos cuando es mayor a 0', () => {
    render(<MonthlyReportTable {...baseProps} rows={[makeRow({ discount: 100 })]} />)
    expect(screen.getAllByText(`−${fmt.format(100)}`).length).toBeGreaterThanOrEqual(1)
  })

  test('muestra — cuando el descuento es 0', () => {
    render(<MonthlyReportTable {...baseProps} rows={[makeRow({ discount: 0, total: 1000 })]} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  test('muestra totales en tfoot correctamente', () => {
    const rows = [
      makeRow({ id: 1, subtotal: 1000, discount: 100, total: 900 }),
      makeRow({ id: 2, subtotal: 2000, discount: 200, total: 1800 }),
    ]
    render(<MonthlyReportTable {...baseProps} rows={rows} />)
    expect(screen.getByText('Total (2 ventas)')).toBeInTheDocument()
    expect(screen.getByText(fmt.format(3000))).toBeInTheDocument()
    expect(screen.getByText(fmt.format(2700))).toBeInTheDocument()
  })

  test('renderiza múltiples filas', () => {
    const rows = [
      makeRow({ id: 1, username: 'user1' }),
      makeRow({ id: 2, username: 'user2' }),
    ]
    render(<MonthlyReportTable {...baseProps} rows={rows} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('user1')).toBeInTheDocument()
    expect(screen.getByText('user2')).toBeInTheDocument()
  })
})
