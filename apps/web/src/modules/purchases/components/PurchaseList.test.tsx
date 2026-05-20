import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PurchaseList } from './PurchaseList'
import type { Purchase } from '@legacy-nexus/shared'

const makePurchase = (status: Purchase['status'] = 'pending'): Purchase => ({
  id: 1,
  supplierId: 1,
  supplierName: 'Proveedor Alfa',
  total: 5000,
  receivedDate: '2026-05-19T14:00:00Z',
  bankRef: null,
  status,
  items: [],
})

const baseProps = {
  purchases: [],
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
  isAdmin: false,
  onReconcile: vi.fn(),
}

describe('PurchaseList', () => {
  test('muestra estado de carga', () => {
    render(<PurchaseList {...baseProps} isLoading />)
    expect(screen.getByText(/cargando compras/i)).toBeInTheDocument()
  })

  test('muestra error con botón reintentar', async () => {
    const onRetry = vi.fn()
    render(<PurchaseList {...baseProps} isError onRetry={onRetry} />)
    expect(screen.getByText(/error al cargar/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  test('muestra mensaje cuando no hay compras', () => {
    render(<PurchaseList {...baseProps} />)
    expect(screen.getByText(/no hay compras/i)).toBeInTheDocument()
  })

  test('renderiza fila de compra con proveedor y estado', () => {
    render(<PurchaseList {...baseProps} purchases={[makePurchase()]} />)
    expect(screen.getByText('Proveedor Alfa')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  test('no muestra botón reconciliar si no es admin', () => {
    render(<PurchaseList {...baseProps} purchases={[makePurchase()]} />)
    expect(screen.queryByRole('button', { name: /reconciliar/i })).toBeNull()
  })

  test('muestra botón reconciliar para admin en compra pendiente', () => {
    render(<PurchaseList {...baseProps} purchases={[makePurchase('pending')]} isAdmin />)
    expect(screen.getByRole('button', { name: /reconciliar/i })).toBeInTheDocument()
  })

  test('no muestra botón reconciliar para compra ya reconciliada', () => {
    render(<PurchaseList {...baseProps} purchases={[makePurchase('reconciled')]} isAdmin />)
    expect(screen.queryByRole('button', { name: /reconciliar/i })).toBeNull()
    expect(screen.getByText('Reconciliada')).toBeInTheDocument()
  })

  test('llama onReconcile con la compra al hacer clic', async () => {
    const onReconcile = vi.fn()
    const purchase = makePurchase('received')
    render(<PurchaseList {...baseProps} purchases={[purchase]} isAdmin onReconcile={onReconcile} />)
    await userEvent.click(screen.getByRole('button', { name: /reconciliar/i }))
    expect(onReconcile).toHaveBeenCalledWith(purchase)
  })

  test('muestra — cuando receivedDate es null', () => {
    render(<PurchaseList {...baseProps} purchases={[{ ...makePurchase(), receivedDate: null }]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
