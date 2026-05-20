import type { IReportRepository } from '../domain/IReportRepository.js'

export interface MonthlyTotalResult {
  total: number
  count: number
}

export class GetMonthlyTotal {
  constructor(private readonly reportRepo: IReportRepository) {}

  async execute(params: { year: number; month: number }): Promise<MonthlyTotalResult> {
    const [total, rows] = await Promise.all([
      this.reportRepo.monthlyTotal(params.year, params.month),
      this.reportRepo.monthlySales(params.year, params.month),
    ])
    return { total, count: rows.length }
  }
}
