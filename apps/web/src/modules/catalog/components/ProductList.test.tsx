import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductList } from './ProductList'

vi.mock('../../auth/hooks/useAuth', () => ({ useCurrentUser: vi.fn() }))
import { useCurrentUser } from '../../auth/hooks/useAuth'

const mockProduct = {
  id: 1,
  sku: 'SKU-001',
  name: 'Teclado Mecánico',
  price: 1500,
  category: 'Electrónica',
  supplierId: 1,
}

const baseProps = {
  products: [],
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
  onDelete: vi.fn(),
}

beforeEach(() => {
  vi.mocked(useCurrentUser).mockReturnValue(null)
})

describe('ProductList', () => {
  test('muestra spinner de carga', () => {
    render(<ProductList {...baseProps} isLoading />)
    expect(screen.getByText(/cargando productos/i)).toBeInTheDocument()
  })

  test('muestra error con botón reintentar', async () => {
    const onRetry = vi.fn()
    render(<ProductList {...baseProps} isError onRetry={onRetry} />)
    expect(screen.getByText(/error al cargar/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  test('muestra mensaje cuando no hay productos', () => {
    render(<ProductList {...baseProps} />)
    expect(screen.getByText(/no hay productos/i)).toBeInTheDocument()
  })

  test('renderiza filas de productos', () => {
    render(<ProductList {...baseProps} products={[mockProduct]} />)
    expect(screen.getByText('SKU-001')).toBeInTheDocument()
    expect(screen.getByText('Teclado Mecánico')).toBeInTheDocument()
    expect(screen.getByText('Electrónica')).toBeInTheDocument()
  })

  test('no muestra botón eliminar para usuarios no admin', () => {
    render(<ProductList {...baseProps} products={[mockProduct]} />)
    expect(screen.queryByRole('button', { name: /eliminar/i })).toBeNull()
  })

  test('muestra botón eliminar solo para admin', () => {
    vi.mocked(useCurrentUser).mockReturnValue({ userId: 1, username: 'admin', isAdmin: true })
    render(<ProductList {...baseProps} products={[mockProduct]} />)
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
  })

  test('llama onDelete con el id al eliminar', async () => {
    const onDelete = vi.fn()
    vi.mocked(useCurrentUser).mockReturnValue({ userId: 1, username: 'admin', isAdmin: true })
    render(<ProductList {...baseProps} products={[mockProduct]} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  test('muestra — cuando category es null', () => {
    render(<ProductList {...baseProps} products={[{ ...mockProduct, category: null }]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
