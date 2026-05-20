import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { InventoryStock, AdjustStockDto } from '@legacy-nexus/shared'
import { httpClient } from '../../../lib/httpClient'

export function useListInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => httpClient<InventoryStock[]>('/inventory'),
  })
}

export function useListByWarehouse(id: number | undefined) {
  return useQuery({
    queryKey: ['inventory', 'warehouse', id],
    queryFn: () => httpClient<InventoryStock[]>(`/inventory/warehouse/${id}`),
    enabled: id !== undefined && id > 0,
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdjustStockDto) =>
      httpClient<void>('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  })
}
