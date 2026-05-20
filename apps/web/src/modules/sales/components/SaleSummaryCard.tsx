import type { SaleSummary } from '@legacy-nexus/shared'

interface Props {
  summary: SaleSummary
  onClose: () => void
}

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.35rem 0',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '0.9rem',
}

export function SaleSummaryCard({ summary, onClose }: Props) {
  return (
    <div
      style={{
        background: '#f0fff4',
        border: '1px solid #b2dfdb',
        borderRadius: '8px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#1a7a1a' }}>Venta registrada #{summary.id}</h3>
        <button
          onClick={onClose}
          aria-label="Cerrar resumen"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#555' }}
        >
          ✕
        </button>
      </div>

      <div style={rowStyle}>
        <span>Artículos</span>
        <span>{summary.items.reduce((s, i) => s + i.quantity, 0)} uds.</span>
      </div>
      <div style={rowStyle}>
        <span>Subtotal</span>
        <span>{fmt.format(summary.subtotal)}</span>
      </div>
      <div style={rowStyle}>
        <span>Descuento</span>
        <span style={{ color: '#b8800a' }}>−{fmt.format(summary.discount)}</span>
      </div>
      <div style={{ ...rowStyle, borderBottom: 'none', fontWeight: 700, fontSize: '1rem', paddingTop: '0.5rem' }}>
        <span>Total (IVA inc.)</span>
        <span>{fmt.format(summary.total)}</span>
      </div>
    </div>
  )
}
