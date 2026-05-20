import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Purchase, Supplier, CreatePurchaseDto, ReconcileDto } from '@legacy-nexus/shared'
import { httpClient } from '../../../lib/httpClient'

export function useListPurchases() {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: () => httpClient<Purchase[]>('/purchases'),
  })
}

export function useListSuppliers() {
  return useQuery({
    queryKey: ['purchases', 'suppliers'],
    queryFn: () => httpClient<Supplier[]>('/purchases/suppliers'),
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePurchaseDto) =>
      httpClient<Purchase>('/purchases', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useReconcile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReconcileDto }) =>
      httpClient<Purchase>(`/purchases/${id}/reconcile`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
    },
  })
}
