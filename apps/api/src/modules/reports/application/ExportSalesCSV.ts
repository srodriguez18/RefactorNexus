import { GetMonthlyReport } from './GetMonthlyReport.js'
import type { IReportRepository } from '../domain/IReportRepository.js'

function escapeCsv(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export class ExportSalesCSV {
  private readonly getMonthlyReport: GetMonthlyReport

  constructor(reportRepo: IReportRepository) {
    this.getMonthlyReport = new GetMonthlyReport(reportRepo)
  }

  async execute(params: { year: number; month: number }): Promise<string> {
    const rows = await this.getMonthlyReport.execute(params)

    const header = ['ID', 'Fecha', 'Usuario', 'Subtotal', 'Descuento', 'Total', 'Artículos'].join(',')

    const lines = rows.map((r) =>
      [
        r.id,
        escapeCsv(r.createdAt.toISOString()),
        escapeCsv(r.username),
        r.subtotal.toFixed(2),
        r.discount.toFixed(2),
        r.total.toFixed(2),
        r.itemCount,
      ].join(','),
    )

    return [header, ...lines].join('\r\n')
  }
}
