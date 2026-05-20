import type { SaleRecord } from '@legacy-nexus/shared'

interface Props {
  sales: SaleRecord[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onReturn: (saleId: number) => void
  isReturning: boolean
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

function statusLabel(status: string): { text: string; color: string } {
  if (status === 'active') return { text: 'Activa', color: '#1a7a1a' }
  if (status === 'returned') return { text: 'Devuelta', color: '#888' }
  return { text: status, color: '#555' }
}

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'medium' })

export function SaleHistory({ sales, isLoading, isError, onRetry, onReturn, isReturning }: Props) {
  if (isLoading) return <p aria-busy="true">Cargando historial…</p>
  if (isError) return (
    <p role="alert" style={{ color: '#c00' }}>
      Error al cargar historial.{' '}
      <button onClick={onRetry} style={{ cursor: 'pointer' }}>Reintentar</button>
    </p>
  )
  if (sales.length === 0) return <p style={{ color: '#888' }}>No hay ventas registradas.</p>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Fecha</th>
            <th style={thStyle}>Subtotal</th>
            <th style={thStyle}>Descuento</th>
            <th style={thStyle}>Total</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const { text, color } = statusLabel(sale.status)
            return (
              <tr key={sale.id}>
                <td style={tdStyle}>#{sale.id}</td>
                <td style={tdStyle}>{fmtDate(sale.createdAt)}</td>
                <td style={tdStyle}>{fmt.format(sale.subtotal)}</td>
                <td style={tdStyle}>{fmt.format(sale.discount)}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt.format(sale.total)}</td>
                <td style={{ ...tdStyle, color }}>{text}</td>
                <td style={tdStyle}>
                  {sale.status === 'active' && (
                    <button
                      onClick={() => onReturn(sale.id)}
                      disabled={isReturning}
                      style={{
                        padding: '0.25rem 0.6rem',
                        fontSize: '0.8rem',
                        cursor: isReturning ? 'not-allowed' : 'pointer',
                        background: 'transparent',
                        border: '1px solid #aaa',
                        borderRadius: '4px',
                        color: '#555',
                      }}
                    >
                      Devolver
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
