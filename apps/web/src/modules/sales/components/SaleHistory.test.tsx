import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SaleHistory } from './SaleHistory'

const makeSale = (status = 'active') => ({
  id: 1,
  userId: 1,
  customerType: 'NORMAL',
  subtotal: 1000,
  discount: 100,
  total: 900,
  status,
  createdAt: '2026-05-19T14:00:00Z',
  items: [],
})

const baseProps = {
  sales: [],
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
  onReturn: vi.fn(),
  isReturning: false,
}

describe('SaleHistory', () => {
  test('muestra estado de carga', () => {
    render(<SaleHistory {...baseProps} isLoading />)
    expect(screen.getByText(/cargando historial/i)).toBeInTheDocument()
  })

  test('muestra error con botón reintentar', async () => {
    const onRetry = vi.fn()
    render(<SaleHistory {...baseProps} isError onRetry={onRetry} />)
    expect(screen.getByText(/error al cargar historial/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  test('muestra mensaje cuando no hay ventas', () => {
    render(<SaleHistory {...baseProps} />)
    expect(screen.getByText(/no hay ventas/i)).toBeInTheDocument()
  })

  test('renderiza fila de venta activa con botón devolver', () => {
    render(<SaleHistory {...baseProps} sales={[makeSale('active')]} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('Activa')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /devolver/i })).toBeInTheDocument()
  })

  test('no muestra botón devolver para venta devuelta', () => {
    render(<SaleHistory {...baseProps} sales={[makeSale('returned')]} />)
    expect(screen.getByText('Devuelta')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /devolver/i })).toBeNull()
  })

  test('llama onReturn con el id al devolver', async () => {
    const onReturn = vi.fn()
    render(<SaleHistory {...baseProps} sales={[makeSale()]} onReturn={onReturn} />)
    await userEvent.click(screen.getByRole('button', { name: /devolver/i }))
    expect(onReturn).toHaveBeenCalledWith(1)
  })

  test('deshabilita el botón devolver mientras isReturning', () => {
    render(<SaleHistory {...baseProps} sales={[makeSale()]} isReturning />)
    expect(screen.getByRole('button', { name: /devolver/i })).toBeDisabled()
  })

  test('renderiza múltiples ventas', () => {
    const sales = [
      makeSale('active'),
      { ...makeSale('returned'), id: 2 },
    ]
    render(<SaleHistory {...baseProps} sales={sales} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
  })
})
