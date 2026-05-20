import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationList } from './NotificationList'
import type { Notification } from '@legacy-nexus/shared'

const makeNotification = (
  status: Notification['status'] = 'unread',
  kind: Notification['kind'] = 'info',
): Notification => ({
  id: 1,
  userId: 1,
  message: 'Mensaje de prueba',
  kind,
  status,
  createdAt: '2026-05-19T14:00:00Z',
})

const baseProps = {
  notifications: [],
  isLoading: false,
  isError: false,
  onRetry: vi.fn(),
  onMarkAsRead: vi.fn(),
  onDelete: vi.fn(),
  isMarkingRead: false,
  isDeleting: false,
}

describe('NotificationList', () => {
  test('muestra estado de carga', () => {
    render(<NotificationList {...baseProps} isLoading />)
    expect(screen.getByText(/cargando notificaciones/i)).toBeInTheDocument()
  })

  test('muestra error con botón reintentar', async () => {
    const onRetry = vi.fn()
    render(<NotificationList {...baseProps} isError onRetry={onRetry} />)
    expect(screen.getByText(/error al cargar/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  test('muestra mensaje cuando no hay notificaciones', () => {
    render(<NotificationList {...baseProps} />)
    expect(screen.getByText(/no tienes notificaciones/i)).toBeInTheDocument()
  })

  test('renderiza notificación con mensaje y etiqueta de tipo', () => {
    render(<NotificationList {...baseProps} notifications={[makeNotification()]} />)
    expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument()
    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  test('muestra botón "Leída" para notificación no leída', () => {
    render(<NotificationList {...baseProps} notifications={[makeNotification('unread')]} />)
    expect(screen.getByRole('button', { name: /leída/i })).toBeInTheDocument()
  })

  test('no muestra botón "Leída" para notificación ya leída', () => {
    render(<NotificationList {...baseProps} notifications={[makeNotification('read')]} />)
    expect(screen.queryByRole('button', { name: /leída/i })).toBeNull()
  })

  test('siempre muestra botón eliminar', () => {
    render(<NotificationList {...baseProps} notifications={[makeNotification()]} />)
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
  })

  test('llama onMarkAsRead con el id al marcar como leída', async () => {
    const onMarkAsRead = vi.fn()
    render(<NotificationList {...baseProps} notifications={[makeNotification()]} onMarkAsRead={onMarkAsRead} />)
    await userEvent.click(screen.getByRole('button', { name: /leída/i }))
    expect(onMarkAsRead).toHaveBeenCalledWith(1)
  })

  test('llama onDelete con el id al eliminar', async () => {
    const onDelete = vi.fn()
    render(<NotificationList {...baseProps} notifications={[makeNotification()]} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  test('deshabilita botón Leída mientras isMarkingRead', () => {
    render(<NotificationList {...baseProps} notifications={[makeNotification()]} isMarkingRead />)
    expect(screen.getByRole('button', { name: /leída/i })).toBeDisabled()
  })

  test('deshabilita botón eliminar mientras isDeleting', () => {
    render(<NotificationList {...baseProps} notifications={[makeNotification()]} isDeleting />)
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeDisabled()
  })

  test('renderiza notificaciones de todos los tipos', () => {
    const kinds: Notification['kind'][] = ['info', 'warn', 'alert', 'system', 'marketing']
    const notifications = kinds.map((kind, i) => ({ ...makeNotification('unread', kind), id: i + 1 }))
    render(<NotificationList {...baseProps} notifications={notifications} />)
    expect(screen.getByText('Info')).toBeInTheDocument()
    expect(screen.getByText('Aviso')).toBeInTheDocument()
    expect(screen.getByText('Alerta')).toBeInTheDocument()
    expect(screen.getByText('Sistema')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
  })
})
