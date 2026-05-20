import { useState } from 'react'
import { useAggregateTotals } from '../hooks/useReports'

const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

const selectStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '0.9rem',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.4rem 0',
  borderBottom: '1px solid #ebebeb',
  fontSize: '0.9rem',
}

export function AggregateTotalsCard() {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i)

  const [year, setYear] = useState<number | undefined>(undefined)
  const [customerType, setCustomerType] = useState<string | undefined>(undefined)

  const query = useAggregateTotals(year, customerType)

  return (
    <div style={{ maxWidth: '480px' }}>
      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Año (opcional)
          <select
            value={year ?? ''}
            onChange={(e) => setYear(e.target.value !== '' ? Number(e.target.value) : undefined)}
            style={selectStyle}
            aria-label="Año"
          >
            <option value="">Todos</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>

        <label style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Tipo de cliente (opcional)
          <select
            value={customerType ?? ''}
            onChange={(e) => setCustomerType(e.target.value !== '' ? e.target.value : undefined)}
            style={selectStyle}
            aria-label="Tipo de cliente"
          >
            <option value="">Todos</option>
            <option value="NORMAL">Normal</option>
            <option value="LEGACY_A">Legacy A</option>
          </select>
        </label>
      </div>

      {/* Card */}
      {query.isLoading && <p aria-busy="true" style={{ color: '#888', fontSize: '0.9rem' }}>Cargando totales…</p>}
      {query.isError && (
        <p role="alert" style={{ color: '#c00', fontSize: '0.9rem' }}>
          Error al cargar totales.{' '}
          <button onClick={() => query.refetch()} style={{ cursor: 'pointer' }}>Reintentar</button>
        </p>
      )}
      {query.data && (
        <div style={{ background: '#f5f5ff', border: '1px solid #d0d0f0', borderRadius: '8px', padding: '1rem 1.25rem' }}>
          <div style={rowStyle}>
            <span style={{ color: '#555' }}>Número de ventas</span>
            <strong>{query.data.count}</strong>
          </div>
          <div style={rowStyle}>
            <span style={{ color: '#555' }}>Subtotal</span>
            <span>{fmt.format(query.data.subtotal)}</span>
          </div>
          <div style={rowStyle}>
            <span style={{ color: '#555' }}>IVA (16%)</span>
            <span style={{ color: '#b8800a' }}>{fmt.format(query.data.vat)}</span>
          </div>
          <div style={{ ...rowStyle, borderBottom: 'none', paddingTop: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
            <span>Total</span>
            <span>{fmt.format(query.data.total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
