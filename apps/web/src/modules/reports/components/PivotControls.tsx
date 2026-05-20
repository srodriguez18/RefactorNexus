import type { RowDimension, ColDimension } from '@legacy-nexus/shared'

const ROW_LABELS: Record<RowDimension, string> = {
  customerType: 'Tipo de cliente',
  status:       'Estado de venta',
  userId:       'Usuario',
}

const COL_LABELS: Record<ColDimension, string> = {
  category:    'Categoría',
  supplierId:  'Proveedor',
  warehouseId: 'Almacén',
}

interface Props {
  year: number
  rowDim: RowDimension
  colDim: ColDimension
  onYear:   (v: number)        => void
  onRowDim: (v: RowDimension)  => void
  onColDim: (v: ColDimension)  => void
  onGenerate: () => void
  isLoading: boolean
}

const selectStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '0.9rem',
}

export function PivotControls({
  year, rowDim, colDim, onYear, onRowDim, onColDim, onGenerate, isLoading,
}: Props) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
      <label style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        Año
        <select value={year} onChange={(e) => onYear(Number(e.target.value))} style={selectStyle} aria-label="Año">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>

      <label style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        Dimensión de fila
        <select
          value={rowDim}
          onChange={(e) => onRowDim(e.target.value as RowDimension)}
          style={selectStyle}
          aria-label="Dimensión de fila"
        >
          {(Object.keys(ROW_LABELS) as RowDimension[]).map((k) => (
            <option key={k} value={k}>{ROW_LABELS[k]}</option>
          ))}
        </select>
      </label>

      <label style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        Dimensión de columna
        <select
          value={colDim}
          onChange={(e) => onColDim(e.target.value as ColDimension)}
          style={selectStyle}
          aria-label="Dimensión de columna"
        >
          {(Object.keys(COL_LABELS) as ColDimension[]).map((k) => (
            <option key={k} value={k}>{COL_LABELS[k]}</option>
          ))}
        </select>
      </label>

      <button
        onClick={onGenerate}
        disabled={isLoading}
        style={{
          padding: '0.45rem 1.25rem',
          background: isLoading ? '#999' : '#1a1a2e',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
        }}
      >
        {isLoading ? 'Generando…' : 'Generar'}
      </button>
    </div>
  )
}
