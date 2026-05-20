import type { MonthlySaleRow } from '@legacy-nexus/shared'

interface Props {
  rows: MonthlySaleRow[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  borderBottom: '2px solid #e0e0e0',
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#555',
}

const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '0.9rem',
}

const tfootTdStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderTop: '2px solid #c0c0c0',
  fontWeight: 700,
  fontSize: '0.9rem',
  background: '#fafafa',
}

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'medium' })

export function MonthlyReportTable({ rows, isLoading, isError, onRetry }: Props) {
  if (isLoading) return <p aria-busy="true">Cargando reporte…</p>

  if (isError) {
    return (
      <p role="alert" style={{ color: '#c00' }}>
        Error al cargar reporte.{' '}
        <button onClick={onRetry} style={{ cursor: 'pointer' }}>Reintentar</button>
      </p>
    )
  }

  if (rows.length === 0) {
    return <p style={{ color: '#888' }}>No hay ventas en este período.</p>
  }

  const totalSubtotal = rows.reduce((s, r) => s + r.subtotal, 0)
  const totalDiscount = rows.reduce((s, r) => s + r.discount, 0)
  const totalAmount  = rows.reduce((s, r) => s + r.total, 0)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Fecha</th>
            <th style={thStyle}>Usuario</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Subtotal</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Descuento</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Arts.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={tdStyle}>#{r.id}</td>
              <td style={tdStyle}>{fmtDate(r.createdAt)}</td>
              <td style={tdStyle}>{r.username}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt.format(r.subtotal)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#b8800a' }}>
                {r.discount > 0 ? `−${fmt.format(r.discount)}` : '—'}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{fmt.format(r.total)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: '#888' }}>{r.itemCount}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ ...tfootTdStyle }}>Total ({rows.length} ventas)</td>
            <td style={{ ...tfootTdStyle, textAlign: 'right' }}>{fmt.format(totalSubtotal)}</td>
            <td style={{ ...tfootTdStyle, textAlign: 'right', color: '#b8800a' }}>
              {totalDiscount > 0 ? `−${fmt.format(totalDiscount)}` : '—'}
            </td>
            <td style={{ ...tfootTdStyle, textAlign: 'right' }}>{fmt.format(totalAmount)}</td>
            <td style={tfootTdStyle} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
