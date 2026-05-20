import { applyVAT } from '@legacy-nexus/finance'
import { AppError } from '../../../lib/AppError.js'
import type { IExportRepository, AggregateTotals } from '../domain/IExportRepository.js'

const VALID_CUSTOMER_TYPES = ['NORMAL', 'LEGACY_A'] as const

export class GetAggregateTotals {
  constructor(private readonly exportRepo: IExportRepository) {}

  async execute(params: {
    year?: number
    customerType?: string
  }): Promise<AggregateTotals> {
    if (
      params.customerType !== undefined &&
      !(VALID_CUSTOMER_TYPES as readonly string[]).includes(params.customerType)
    ) {
      throw new AppError('Tipo de cliente inválido', 400)
    }

    const result = await this.exportRepo.aggregateTotals({
      year: params.year,
      customerType: params.customerType as 'NORMAL' | 'LEGACY_A' | undefined,
    })

    // Re-derive VAT from the aggregated subtotal using the finance package
    // instead of duplicating the CASE WHEN discount logic in SQL
    const vat = parseFloat((applyVAT(result.subtotal) - result.subtotal).toFixed(2))

    return { ...result, vat }
  }
}
