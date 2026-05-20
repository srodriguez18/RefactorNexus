import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateSaleDto, SaleRecord, SaleSummary } from '@legacy-nexus/shared'
import { httpClient } from '../../../lib/httpClient'

export function useSaleHistory(userId: number | undefined) {
  return useQuery({
    queryKey: ['sales', 'user', userId],
    queryFn: () => httpClient<SaleRecord[]>(`/sales/user/${userId}`),
    enabled: userId !== undefined,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSaleDto) => httpClient<SaleSummary>('/sales', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useReturnSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (saleId: number) => httpClient<SaleRecord>(`/sales/${saleId}/return`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}
