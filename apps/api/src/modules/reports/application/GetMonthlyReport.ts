import type { IReportRepository, MonthlySaleRow } from '../domain/IReportRepository.js'

export class GetMonthlyReport {
  constructor(private readonly reportRepo: IReportRepository) {}

  async execute(params: { year: number; month: number }): Promise<MonthlySaleRow[]> {
    return this.reportRepo.monthlySales(params.year, params.month)
  }
}
