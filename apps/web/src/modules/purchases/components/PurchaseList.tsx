import type { Purchase, PurchaseStatus } from '@legacy-nexus/shared'

interface Props {
  purchases: Purchase[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  isAdmin: boolean
  onReconcile: (purchase: Purchase) => void
}

const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '0.9rem',
}

const STATUS_STYLE: Record<PurchaseStatus, { text: string; color: string }> = {
  pending:    { text: 'Pendiente',    color: '#888' },
  received:   { text: 'Recibida',     color: '#1565c0' },
  reconciled: { text: 'Reconciliada', color: '#1a7a1a' },
}

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—'

export function PurchaseList({ purchases, isLoading, isError, onRetry, isAdmin, onReconcile }: Props) {
  if (isLoading) return <p aria-busy="true">Cargando compras…</p>

  if (isError) {
    return (
      <p role="alert" style={{ color: '#c00' }}>
        Error al cargar compras.{' '}
        <button onClick={onRetry} style={{ cursor: 'pointer' }}>Reintentar</button>
      </p>
    )
  }

  if (purchases.length === 0) {
    return <p style={{ color: '#888' }}>No hay compras registradas.</p>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Proveedor</th>
            <th>Total</th>
            <th>Fecha recepción</th>
            <th>Estado</th>
            {isAdmin && <th></th>}
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => {
            const { text, color } = STATUS_STYLE[p.status]
            return (
              <tr key={p.id}>
                <td style={tdStyle}>#{p.id}</td>
                <td style={tdStyle}>{p.supplierName}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt.format(p.total)}</td>
                <td style={tdStyle}>{fmtDate(p.receivedDate)}</td>
                <td style={{ ...tdStyle, color, fontWeight: 500 }}>{text}</td>
                {isAdmin && (
                  <td style={tdStyle}>
                    {p.status !== 'reconciled' && (
                      <button
                        onClick={() => onReconcile(p)}
                        style={{
                          padding: '0.25rem 0.6rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          background: 'transparent',
                          border: '1px solid #aaa',
                          borderRadius: '4px',
                          color: '#444',
                        }}
                      >
                        Reconciliar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
