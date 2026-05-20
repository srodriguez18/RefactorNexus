import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PivotTable } from './PivotTable'
import type { PivotRow } from '@legacy-nexus/shared'

const makeRow = (rowLabel: string, colLabel: string, total: number): PivotRow => ({
  rowLabel,
  colLabel,
  total,
})

const baseProps = {
  rows: [],
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
  empty: false,
}

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

describe('PivotTable', () => {
  test('muestra instrucción cuando empty es true', () => {
    render(<PivotTable {...baseProps} empty />)
    expect(screen.getByText(/selecciona las dimensiones/i)).toBeInTheDocument()
  })

  test('muestra estado de carga', () => {
    render(<PivotTable {...baseProps} isLoading />)
    expect(screen.getByText(/generando tabla/i)).toBeInTheDocument()
  })

  test('muestra error con botón reintentar', async () => {
    const onRetry = vi.fn()
    render(<PivotTable {...baseProps} isError onRetry={onRetry} />)
    expect(screen.getByText(/error al generar tabla/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  test('muestra mensaje cuando no hay datos', () => {
    render(<PivotTable {...baseProps} />)
    expect(screen.getByText(/sin datos para este período/i)).toBeInTheDocument()
  })

  test('renderiza etiquetas de filas y columnas', () => {
    const rows = [
      makeRow('NORMAL', 'Ene', 1000),
      makeRow('VIP', 'Ene', 2000),
    ]
    render(<PivotTable {...baseProps} rows={rows} />)
    expect(screen.getByText('NORMAL')).toBeInTheDocument()
    expect(screen.getByText('VIP')).toBeInTheDocument()
    expect(screen.getAllByText('Ene').length).toBeGreaterThanOrEqual(1)
  })

  test('renderiza totales de fila correctamente', () => {
    const rows = [
      makeRow('NORMAL', 'Ene', 1000),
      makeRow('NORMAL', 'Feb', 500),
    ]
    render(<PivotTable {...baseProps} rows={rows} />)
    expect(screen.getAllByText(fmt.format(1500)).length).toBeGreaterThanOrEqual(1)
  })

  test('renderiza grandTotal en tfoot', () => {
    const rows = [
      makeRow('NORMAL', 'Ene', 1000),
      makeRow('VIP', 'Ene', 2000),
    ]
    render(<PivotTable {...baseProps} rows={rows} />)
    expect(screen.getAllByText(fmt.format(3000)).length).toBeGreaterThanOrEqual(1)
  })

  test('muestra — para celdas con valor 0', () => {
    const rows = [
      makeRow('NORMAL', 'Ene', 1000),
      makeRow('VIP', 'Feb', 500),
    ]
    render(<PivotTable {...baseProps} rows={rows} />)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  test('empty toma precedencia sobre isLoading', () => {
    render(<PivotTable {...baseProps} empty isLoading />)
    expect(screen.getByText(/selecciona las dimensiones/i)).toBeInTheDocument()
    expect(screen.queryByText(/generando tabla/i)).toBeNull()
  })
})
