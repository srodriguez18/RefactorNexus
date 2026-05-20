import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Refund, CreateRefundDto, SaleRecord } from '@legacy-nexus/shared'
import { httpClient } from '../../../lib/httpClient'

export function useListRefunds(userId: number | undefined) {
  return useQuery({
    queryKey: ['refunds', 'user', userId],
    queryFn: () => httpClient<Refund[]>(`/refunds/user/${userId}`),
    enabled: userId !== undefined,
  })
}

export function useSaleById(saleId: number | undefined) {
  return useQuery({
    queryKey: ['sales', saleId],
    queryFn: () => httpClient<SaleRecord>(`/sales/${saleId}`),
    enabled: saleId !== undefined && saleId > 0,
    retry: false,
  })
}

export function useCreateRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRefundDto) =>
      httpClient<Refund>('/refunds', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['refunds'] }),
  })
}

export function useApproveRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      httpClient<Refund>(`/refunds/${id}/approve`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['refunds'] }),
  })
}

export function useRejectRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      httpClient<Refund>(`/refunds/${id}/reject`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['refunds'] }),
  })
}
