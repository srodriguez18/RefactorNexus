import { useQuery } from '@tanstack/react-query'
import type {
  MonthlySaleRow,
  MonthlyTotal,
  PivotRow,
  AggregateTotals,
  RowDimension,
  ColDimension,
} from '@legacy-nexus/shared'
import { httpClient } from '../../../lib/httpClient'

export function useMonthlyReport(year: number | undefined, month: number | undefined) {
  return useQuery({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: () =>
      httpClient<MonthlySaleRow[]>(`/reports/monthly?year=${year}&month=${month}`),
    enabled: year !== undefined && month !== undefined,
  })
}

export function useMonthlyTotal(year: number | undefined, month: number | undefined) {
  return useQuery({
    queryKey: ['reports', 'total', year, month],
    queryFn: () =>
      httpClient<MonthlyTotal>(`/reports/total?year=${year}&month=${month}`),
    enabled: year !== undefined && month !== undefined,
  })
}

export function usePivotReport(params: {
  year: number | undefined
  rowDim: RowDimension | undefined
  colDim: ColDimension | undefined
  enabled: boolean
}) {
  return useQuery({
    queryKey: ['reports', 'pivot', params.year, params.rowDim, params.colDim],
    queryFn: () =>
      httpClient<PivotRow[]>(
        `/reports/pivot?year=${params.year}&rowDim=${params.rowDim}&colDim=${params.colDim}`,
      ),
    enabled: params.enabled && !!params.year && !!params.rowDim && !!params.colDim,
  })
}

export function useAggregateTotals(year: number | undefined, customerType: string | undefined) {
  const qs = new URLSearchParams()
  if (year !== undefined) qs.set('year', String(year))
  if (customerType !== undefined) qs.set('customerType', customerType)
  return useQuery({
    queryKey: ['reports', 'aggregate', year, customerType],
    queryFn: () => httpClient<AggregateTotals>(`/reports/aggregate?${qs.toString()}`),
  })
}

async function triggerDownload(url: string, filename: string): Promise<void> {
  const token = localStorage.getItem('token')
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? `Error ${response.status}`)
  }
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}

export function useExportCSV() {
  return (year: number, month: number): Promise<void> =>
    triggerDownload(
      `/api/reports/export?year=${year}&month=${month}`,
      `ventas-${year}-${String(month).padStart(2, '0')}.csv`,
    )
}

export function useDownloadCSV() {
  return (params: { year?: number; month?: number; customerType?: string }): Promise<void> => {
    const qs = new URLSearchParams()
    if (params.year !== undefined) qs.set('year', String(params.year))
    if (params.month !== undefined) qs.set('month', String(params.month))
    if (params.customerType !== undefined) qs.set('customerType', params.customerType)
    const filename = params.year
      ? `export-${params.year}${params.month ? `-${String(params.month).padStart(2, '0')}` : ''}.csv`
      : 'export.csv'
    return triggerDownload(`/api/reports/export-csv?${qs.toString()}`, filename)
  }
}
