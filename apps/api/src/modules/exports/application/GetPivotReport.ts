import { isValidRowDimension, isValidColDimension } from '../domain/PivotDimension.js'
import type { IExportRepository, PivotRow } from '../domain/IExportRepository.js'

export class GetPivotReport {
  constructor(private readonly exportRepo: IExportRepository) {}

  async execute(params: { year: number; rowDim: string; colDim: string }): Promise<PivotRow[]> {
    if (!isValidRowDimension(params.rowDim)) {
      throw new Error('Dimensión de fila inválida')
    }
    if (!isValidColDimension(params.colDim)) {
      throw new Error('Dimensión de columna inválida')
    }
    return this.exportRepo.pivotData({
      year: params.year,
      rowDim: params.rowDim,
      colDim: params.colDim,
    })
  }
}
