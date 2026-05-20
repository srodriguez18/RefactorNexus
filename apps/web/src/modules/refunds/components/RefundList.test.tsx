import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RefundList } from './RefundList'
import type { Refund } from '@legacy-nexus/shared'

const makeRefund = (status: Refund['status'] = 'pending'): Refund => ({
  id: 1,
  saleId: 10,
  userId: 1,
  reason: 'Producto llegó dañado',
  amount: 850,
  status,
  approvedBy: null,
  createdAt: '2026-05-19T14:00:00Z',
})

const baseProps = {
  refunds: [],
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
  isAdmin: false,
  onApprove: vi.fn(),
  onReject: vi.fn(),
  isApproving: false,
  isRejecting: false,
}

describe('RefundList', () => {
  test('muestra estado de carga', () => {
    render(<RefundList {...baseProps} isLoading />)
    expect(screen.getByText(/cargando reembolsos/i)).toBeInTheDocument()
  })

  test('muestra error con botón reintentar', async () => {
    const onRetry = vi.fn()
    render(<RefundList {...baseProps} isError onRetry={onRetry} />)
    expect(screen.getByText(/error al cargar/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  test('muestra mensaje cuando no hay reembolsos', () => {
    render(<RefundList {...baseProps} />)
    expect(screen.getByText(/no hay reembolsos/i)).toBeInTheDocument()
  })

  test('renderiza fila con razón y estado pendiente', () => {
    render(<RefundList {...baseProps} refunds={[makeRefund()]} />)
    expect(screen.getByText('Producto llegó dañado')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  test('no muestra botones de acción para usuario no admin', () => {
    render(<RefundList {...baseProps} refunds={[makeRefund()]} />)
    expect(screen.queryByRole('button', { name: /aprobar/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /rechazar/i })).toBeNull()
  })

  test('muestra botones aprobar y rechazar para admin con estado pending', () => {
    render(<RefundList {...baseProps} refunds={[makeRefund('pending')]} isAdmin />)
    expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument()
  })

  test('no muestra botones de acción para reembolso aprobado', () => {
    render(<RefundList {...baseProps} refunds={[makeRefund('approved')]} isAdmin />)
    expect(screen.queryByRole('button', { name: /aprobar/i })).toBeNull()
    expect(screen.getByText('Aprobado')).toBeInTheDocument()
  })

  test('llama onApprove con el id al aprobar', async () => {
    const onApprove = vi.fn()
    render(<RefundList {...baseProps} refunds={[makeRefund()]} isAdmin onApprove={onApprove} />)
    await userEvent.click(screen.getByRole('button', { name: /aprobar/i }))
    expect(onApprove).toHaveBeenCalledWith(1)
  })

  test('llama onReject con el id al rechazar', async () => {
    const onReject = vi.fn()
    render(<RefundList {...baseProps} refunds={[makeRefund()]} isAdmin onReject={onReject} />)
    await userEvent.click(screen.getByRole('button', { name: /rechazar/i }))
    expect(onReject).toHaveBeenCalledWith(1)
  })

  test('deshabilita botones mientras isApproving', () => {
    render(<RefundList {...baseProps} refunds={[makeRefund()]} isAdmin isApproving />)
    expect(screen.getByRole('button', { name: /aprobar/i })).toBeDisabled()
  })

  test('deshabilita botones mientras isRejecting', () => {
    render(<RefundList {...baseProps} refunds={[makeRefund()]} isAdmin isRejecting />)
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeDisabled()
  })
})
