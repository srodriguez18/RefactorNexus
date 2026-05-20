import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Product, CreateProductDto } from '@legacy-nexus/shared'
import { httpClient } from '../../../lib/httpClient'

export function useListProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => httpClient<Product[]>('/catalog'),
  })
}

export function useSearchProducts(term: string) {
  return useQuery({
    queryKey: ['products', 'search', term],
    queryFn: () => httpClient<Product[]>(`/catalog/search?q=${encodeURIComponent(term)}`),
    enabled: term.trim().length > 0,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductDto) =>
      httpClient<Product>('/catalog', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      httpClient<void>(`/catalog/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
