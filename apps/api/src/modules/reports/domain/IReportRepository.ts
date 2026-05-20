export interface MonthlySaleRow {
  id: number
  createdAt: Date
  username: string
  subtotal: number
  discount: number
  total: number
  itemCount: number
}

export interface IReportRepository {
  monthlySales(year: number, month: number): Promise<MonthlySaleRow[]>
  monthlyTotal(year: number, month: number): Promise<number>
}
