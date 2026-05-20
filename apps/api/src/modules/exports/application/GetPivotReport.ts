import { AppError } from '../../../lib/AppError.js'
import { isValidRowDimension, isValidColDimension } from '../domain/PivotDimension.js'
import type { IExportRepository, PivotRow } from '../domain/IExportRepository.js'

export class GetPivotReport {
  constructor(private readonly exportRepo: IExportRepository) {}

  async execute(params: { year: number; rowDim: string; colDim: string }): Promise<PivotRow[]> {
    if (!isValidRowDimension(params.rowDim)) {
      throw new AppError('Dimensión de fila inválida', 400)
    }
    if (!isValidColDimension(params.colDim)) {
      throw new AppError('Dimensión de columna inválida', 400)
    }
    return this.exportRepo.pivotData({
      year: params.year,
      rowDim: params.rowDim,
      colDim: params.colDim,
    })
  }
}
