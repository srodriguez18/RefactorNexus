import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  Notification,
  CreateNotificationDto,
  BroadcastNotificationDto,
} from '@legacy-nexus/shared'
import { httpClient } from '../../../lib/httpClient'

export function useListNotifications(userId: number | undefined) {
  return useQuery({
    queryKey: ['notifications', 'user', userId],
    queryFn: () => httpClient<Notification[]>(`/notifications/user/${userId}`),
    enabled: userId !== undefined,
    refetchInterval: 30000,
  })
}

export function useCreateNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateNotificationDto) =>
      httpClient<Notification>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useBroadcast() {
  return useMutation({
    mutationFn: (data: BroadcastNotificationDto) =>
      httpClient<{ count: number }>('/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      httpClient<void>(`/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      httpClient<void>(`/notifications/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
