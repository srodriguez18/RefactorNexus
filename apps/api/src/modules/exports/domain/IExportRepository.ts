import type { RowDimension, ColDimension } from './PivotDimension.js'

export interface PivotParams {
  year: number
  rowDim: RowDimension
  colDim: ColDimension
}

export interface TotalsParams {
  year?: number
  customerType?: 'NORMAL' | 'LEGACY_A'
}

export interface CSVParams {
  year?: number
  month?: number
  customerType?: string
}

export interface PivotRow {
  rowLabel: string
  colLabel: string
  total: number
  count: number
}

export interface AggregateTotals {
  subtotal: number
  vat: number
  total: number
  count: number
}

export interface SaleCSVRow {
  id: number
  date: Date
  username: string
  customerType: string
  subtotal: number
  discount: number
  total: number
}

export interface IExportRepository {
  pivotData(params: PivotParams): Promise<PivotRow[]>
  aggregateTotals(params: TotalsParams): Promise<AggregateTotals>
  salesForCSV(params: CSVParams): Promise<SaleCSVRow[]>
}
