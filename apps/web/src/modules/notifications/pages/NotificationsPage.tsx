import { useState } from 'react'
import { useAuthContext } from '../../../context/AuthContext'
import {
  useListNotifications,
  useMarkAsRead,
  useDeleteNotification,
} from '../hooks/useNotifications'
import { NotificationList } from '../components/NotificationList'
import { BroadcastForm } from '../components/BroadcastForm'

export function NotificationsPage() {
  const { currentUser } = useAuthContext()
  const [actionError, setActionError] = useState<string | null>(null)
  const listQuery = useListNotifications(currentUser?.userId)
  const markAsRead = useMarkAsRead()
  const deleteNotification = useDeleteNotification()

  return (
    <div style={{ maxWidth: '680px' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem' }}>Notificaciones</h1>

      {actionError && (
        <p style={{ color: '#c00', marginBottom: '0.75rem', fontSize: '0.9rem' }}>{actionError}</p>
      )}

      <NotificationList
        notifications={listQuery.data ?? []}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        onRetry={() => listQuery.refetch()}
        onMarkAsRead={(id) => {
          setActionError(null)
          markAsRead.mutate(id, {
            onError: (err) =>
              setActionError(err instanceof Error ? err.message : 'Error al marcar notificación'),
          })
        }}
        onDelete={(id) => {
          setActionError(null)
          deleteNotification.mutate(id, {
            onError: (err) =>
              setActionError(err instanceof Error ? err.message : 'Error al eliminar notificación'),
          })
        }}
        isMarkingRead={markAsRead.isPending}
        isDeleting={deleteNotification.isPending}
      />

      {currentUser?.isAdmin && <BroadcastForm />}
    </div>
  )
}
