import { useAuthContext } from '../../../context/AuthContext'
import { useListNotifications } from '../hooks/useNotifications'

export function NotificationBadge() {
  const { currentUser } = useAuthContext()
  const { data } = useListNotifications(currentUser?.userId)

  const unreadCount = data?.filter((n) => n.status === 'unread').length ?? 0

  if (unreadCount === 0) return null

  return (
    <span
      aria-label={`${unreadCount} notificaciones sin leer`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '1.1rem',
        height: '1.1rem',
        padding: '0 0.3rem',
        background: '#e53935',
        color: '#fff',
        borderRadius: '999px',
        fontSize: '0.7rem',
        fontWeight: 700,
        lineHeight: 1,
        marginLeft: '0.3rem',
        verticalAlign: 'middle',
      }}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )
}
