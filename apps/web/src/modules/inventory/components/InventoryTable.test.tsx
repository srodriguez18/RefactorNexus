import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InventoryTable } from './InventoryTable'

const makeStock = (quantity: number) => ({
  productId: 1,
  warehouseId: 1,
  quantity,
  productName: 'Monitor 24"',
  warehouseName: 'Almacén Central',
})

const baseProps = {
  stocks: [],
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
}

describe('InventoryTable', () => {
  test('muestra estado de carga', () => {
    render(<InventoryTable {...baseProps} isLoading />)
    expect(screen.getByText(/cargando inventario/i)).toBeInTheDocument()
  })

  test('muestra error con botón reintentar', async () => {
    const onRetry = vi.fn()
    render(<InventoryTable {...baseProps} isError onRetry={onRetry} />)
    expect(screen.getByText(/error al cargar/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  test('muestra mensaje cuando no hay registros', () => {
    render(<InventoryTable {...baseProps} />)
    expect(screen.getByText(/sin registros/i)).toBeInTheDocument()
  })

  test('renderiza filas con nombre de producto y almacén', () => {
    render(<InventoryTable {...baseProps} stocks={[makeStock(10)]} />)
    expect(screen.getByText('Monitor 24"')).toBeInTheDocument()
    expect(screen.getByText('Almacén Central')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  test('muestra cantidad 0 en color rojo', () => {
    render(<InventoryTable {...baseProps} stocks={[makeStock(0)]} />)
    const cell = screen.getByText('0')
    expect(cell).toHaveStyle({ color: '#c00' })
  })

  test('muestra cantidad baja (< 5) en color ámbar', () => {
    render(<InventoryTable {...baseProps} stocks={[makeStock(3)]} />)
    const cell = screen.getByText('3')
    expect(cell).toHaveStyle({ color: '#b8800a' })
  })

  test('muestra cantidad normal sin color especial', () => {
    render(<InventoryTable {...baseProps} stocks={[makeStock(20)]} />)
    const cell = screen.getByText('20')
    expect(cell).toHaveStyle({ color: 'inherit' })
  })

  test('renderiza múltiples filas', () => {
    const stocks = [
      { productId: 1, warehouseId: 1, quantity: 5, productName: 'Prod A', warehouseName: 'Almacén 1' },
      { productId: 2, warehouseId: 1, quantity: 8, productName: 'Prod B', warehouseName: 'Almacén 1' },
    ]
    render(<InventoryTable {...baseProps} stocks={stocks} />)
    expect(screen.getByText('Prod A')).toBeInTheDocument()
    expect(screen.getByText('Prod B')).toBeInTheDocument()
  })
})
