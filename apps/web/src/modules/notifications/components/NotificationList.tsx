import type { Notification, NotificationKind } from '@legacy-nexus/shared'

interface Props {
  notifications: Notification[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onMarkAsRead: (id: number) => void
  onDelete: (id: number) => void
  isMarkingRead: boolean
  isDeleting: boolean
}

const KIND_COLOR: Record<NotificationKind, string> = {
  info: '#1565c0',
  warn: '#b8800a',
  alert: '#c00',
  system: '#555',
  marketing: '#1a7a1a',
}

const KIND_BG: Record<NotificationKind, string> = {
  info: '#e3f2fd',
  warn: '#fff8e1',
  alert: '#ffebee',
  system: '#f5f5f5',
  marketing: '#e8f5e9',
}

const KIND_LABEL: Record<NotificationKind, string> = {
  info: 'Info',
  warn: 'Aviso',
  alert: 'Alerta',
  system: 'Sistema',
  marketing: 'Marketing',
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })

export function NotificationList({
  notifications,
  isLoading,
  isError,
  onRetry,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: Props) {
  if (isLoading) return <p aria-busy="true">Cargando notificaciones…</p>

  if (isError) {
    return (
      <p role="alert" style={{ color: '#c00' }}>
        Error al cargar notificaciones.{' '}
        <button onClick={onRetry} style={{ cursor: 'pointer' }}>
          Reintentar
        </button>
      </p>
    )
  }

  if (notifications.length === 0) {
    return <p style={{ color: '#888' }}>No tienes notificaciones.</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {notifications.map((n) => {
        const color = KIND_COLOR[n.kind]
        const bg = n.status === 'unread' ? KIND_BG[n.kind] : '#fafafa'
        return (
          <li
            key={n.id}
            style={{
              background: bg,
              border: `1px solid ${n.status === 'unread' ? color + '66' : '#e0e0e0'}`,
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              marginBottom: '0.6rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            {/* Kind badge */}
            <span
              style={{
                flexShrink: 0,
                fontSize: '0.75rem',
                fontWeight: 600,
                color,
                background: KIND_BG[n.kind],
                border: `1px solid ${color}44`,
                borderRadius: '4px',
                padding: '0.1rem 0.45rem',
                marginTop: '0.1rem',
              }}
            >
              {KIND_LABEL[n.kind]}
            </span>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: '0 0 0.25rem',
                  fontSize: '0.9rem',
                  fontWeight: n.status === 'unread' ? 600 : 400,
                  wordBreak: 'break-word',
                }}
              >
                {n.message}
              </p>
              <span style={{ fontSize: '0.78rem', color: '#888' }}>{fmtDate(n.createdAt)}</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexShrink: 0, gap: '0.4rem' }}>
              {n.status === 'unread' && (
                <button
                  onClick={() => onMarkAsRead(n.id)}
                  disabled={isMarkingRead}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.2rem 0.55rem',
                    cursor: isMarkingRead ? 'not-allowed' : 'pointer',
                    background: 'none',
                    border: '1px solid #aaa',
                    borderRadius: '4px',
                    color: '#444',
                  }}
                >
                  Leída
                </button>
              )}
              <button
                onClick={() => onDelete(n.id)}
                disabled={isDeleting}
                aria-label="Eliminar notificación"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.2rem 0.5rem',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  color: '#888',
                }}
              >
                ✕
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
