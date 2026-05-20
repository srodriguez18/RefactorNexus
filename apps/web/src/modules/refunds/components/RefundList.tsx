import type { Refund, RefundStatus } from '@legacy-nexus/shared'

interface Props {
  refunds: Refund[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  isAdmin: boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
  isApproving: boolean
  isRejecting: boolean
}

const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '0.9rem',
}

const STATUS_STYLE: Record<RefundStatus, { text: string; color: string }> = {
  pending:  { text: 'Pendiente', color: '#b8800a' },
  approved: { text: 'Aprobado',  color: '#1a7a1a' },
  rejected: { text: 'Rechazado', color: '#c00' },
}

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'medium' })

export function RefundList({
  refunds, isLoading, isError, onRetry,
  isAdmin, onApprove, onReject, isApproving, isRejecting,
}: Props) {
  if (isLoading) return <p aria-busy="true">Cargando reembolsos…</p>

  if (isError) {
    return (
      <p role="alert" style={{ color: '#c00' }}>
        Error al cargar reembolsos.{' '}
        <button onClick={onRetry} style={{ cursor: 'pointer' }}>Reintentar</button>
      </p>
    )
  }

  if (refunds.length === 0) {
    return <p style={{ color: '#888' }}>No hay reembolsos registrados.</p>
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Venta</th>
            <th>Monto</th>
            <th>Razón</th>
            <th>Estado</th>
            <th>Fecha</th>
            {isAdmin && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {refunds.map((r) => {
            const { text, color } = STATUS_STYLE[r.status]
            return (
              <tr key={r.id}>
                <td style={tdStyle}>#{r.id}</td>
                <td style={tdStyle}>#{r.saleId}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt.format(r.amount)}</td>
                <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.reason}
                </td>
                <td style={{ ...tdStyle, color, fontWeight: 500 }}>{text}</td>
                <td style={tdStyle}>{fmtDate(r.createdAt)}</td>
                {isAdmin && (
                  <td style={tdStyle}>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => onApprove(r.id)}
                          disabled={isApproving}
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.2rem 0.6rem',
                            cursor: isApproving ? 'not-allowed' : 'pointer',
                            background: '#e8f5e9',
                            border: '1px solid #a5d6a7',
                            borderRadius: '4px',
                            color: '#1a7a1a',
                          }}
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => onReject(r.id)}
                          disabled={isRejecting}
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.2rem 0.6rem',
                            cursor: isRejecting ? 'not-allowed' : 'pointer',
                            background: '#fff0f0',
                            border: '1px solid #f5c6c6',
                            borderRadius: '4px',
                            color: '#c00',
                          }}
                        >
                          Rechazar
                        </button>
                      </div>
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
