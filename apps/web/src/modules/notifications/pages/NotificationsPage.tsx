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
  const listQuery = useListNotifications(currentUser?.userId)
  const markAsRead = useMarkAsRead()
  const deleteNotification = useDeleteNotification()

  return (
    <div style={{ maxWidth: '680px' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem' }}>Notificaciones</h1>

      <NotificationList
        notifications={listQuery.data ?? []}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        onRetry={() => listQuery.refetch()}
        onMarkAsRead={(id) => markAsRead.mutate(id)}
        onDelete={(id) => deleteNotification.mutate(id)}
        isMarkingRead={markAsRead.isPending}
        isDeleting={deleteNotification.isPending}
      />

      {currentUser?.isAdmin && <BroadcastForm />}
    </div>
  )
}
