export type RowDimension = 'customerType' | 'status' | 'userId'
export type ColDimension = 'category' | 'supplierId' | 'warehouseId'

const VALID_ROW: readonly RowDimension[] = ['customerType', 'status', 'userId']
const VALID_COL: readonly ColDimension[] = ['category', 'supplierId', 'warehouseId']

export function isValidRowDimension(v: string): v is RowDimension {
  return (VALID_ROW as readonly string[]).includes(v)
}

export function isValidColDimension(v: string): v is ColDimension {
  return (VALID_COL as readonly string[]).includes(v)
}
