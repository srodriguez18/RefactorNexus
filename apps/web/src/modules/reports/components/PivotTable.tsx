import type { PivotRow } from '@legacy-nexus/shared'

interface Props {
  rows: PivotRow[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  empty: boolean
}

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

const thStyle: React.CSSProperties = {
  padding: '0.45rem 0.75rem',
  borderBottom: '2px solid #e0e0e0',
  fontWeight: 600,
  fontSize: '0.82rem',
  color: '#555',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '0.4rem 0.75rem',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '0.85rem',
  textAlign: 'right',
}

const tfootTd: React.CSSProperties = {
  padding: '0.45rem 0.75rem',
  borderTop: '2px solid #c0c0c0',
  fontWeight: 700,
  fontSize: '0.85rem',
  textAlign: 'right',
  background: '#fafafa',
}

export function PivotTable({ rows, isLoading, isError, onRetry, empty }: Props) {
  if (empty) {
    return (
      <p style={{ color: '#888', fontStyle: 'italic' }}>
        Selecciona las dimensiones y genera el reporte.
      </p>
    )
  }
  if (isLoading) return <p aria-busy="true">Generando tabla…</p>
  if (isError) {
    return (
      <p role="alert" style={{ color: '#c00' }}>
        Error al generar tabla.{' '}
        <button onClick={onRetry} style={{ cursor: 'pointer' }}>Reintentar</button>
      </p>
    )
  }
  if (rows.length === 0) return <p style={{ color: '#888' }}>Sin datos para este período.</p>

  // Build unique sorted axes
  const rowLabels = [...new Set(rows.map((r) => r.rowLabel))].sort()
  const colLabels = [...new Set(rows.map((r) => r.colLabel))].sort()

  // Index data: rowLabel → colLabel → total
  const index = new Map<string, Map<string, number>>()
  for (const r of rows) {
    if (!index.has(r.rowLabel)) index.set(r.rowLabel, new Map())
    const existing = index.get(r.rowLabel)!.get(r.colLabel) ?? 0
    index.get(r.rowLabel)!.set(r.colLabel, existing + r.total)
  }

  const colTotals = new Map<string, number>()
  for (const col of colLabels) {
    const sum = rowLabels.reduce((s, row) => s + (index.get(row)?.get(col) ?? 0), 0)
    colTotals.set(col, sum)
  }

  const rowTotals = new Map<string, number>()
  for (const row of rowLabels) {
    const sum = colLabels.reduce((s, col) => s + (index.get(row)?.get(col) ?? 0), 0)
    rowTotals.set(row, sum)
  }

  const grandTotal = colLabels.reduce((s, col) => s + (colTotals.get(col) ?? 0), 0)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, textAlign: 'left' }}></th>
            {colLabels.map((col) => (
              <th key={col} style={thStyle}>{col}</th>
            ))}
            <th style={{ ...thStyle, color: '#1a1a2e' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((row) => (
            <tr key={row}>
              <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{row}</td>
              {colLabels.map((col) => {
                const val = index.get(row)?.get(col) ?? 0
                return (
                  <td key={col} style={{ ...tdStyle, color: val === 0 ? '#ccc' : 'inherit' }}>
                    {val === 0 ? '—' : fmt.format(val)}
                  </td>
                )
              })}
              <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt.format(rowTotals.get(row) ?? 0)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ ...tfootTd, textAlign: 'left' }}>Total</td>
            {colLabels.map((col) => (
              <td key={col} style={tfootTd}>{fmt.format(colTotals.get(col) ?? 0)}</td>
            ))}
            <td style={tfootTd}>{fmt.format(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
