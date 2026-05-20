import type { IExportRepository } from '../domain/IExportRepository.js'

function escapeCsv(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const VALID_CUSTOMER_TYPES = ['NORMAL', 'LEGACY_A'] as const

export class DownloadCSV {
  constructor(private readonly exportRepo: IExportRepository) {}

  async execute(params: {
    year?: number
    month?: number
    customerType?: string
  }): Promise<string> {
    if (
      params.customerType !== undefined &&
      !(VALID_CUSTOMER_TYPES as readonly string[]).includes(params.customerType)
    ) {
      throw new Error('Tipo de cliente inválido')
    }

    const rows = await this.exportRepo.salesForCSV({
      year: params.year,
      month: params.month,
      customerType: params.customerType,
    })

    const header = ['ID', 'Fecha', 'Usuario', 'TipoCliente', 'Subtotal', 'Descuento', 'Total'].join(',')

    const lines = rows.map((r) =>
      [
        r.id,
        escapeCsv(r.date.toISOString()),
        escapeCsv(r.username),
        escapeCsv(r.customerType),
        r.subtotal.toFixed(2),
        r.discount.toFixed(2),
        r.total.toFixed(2),
      ].join(','),
    )

    return [header, ...lines].join('\r\n')
  }
}
