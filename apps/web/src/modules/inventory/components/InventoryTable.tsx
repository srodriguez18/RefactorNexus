import type { InventoryStock } from '@legacy-nexus/shared'

interface Props {
  stocks: InventoryStock[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.6rem 0.75rem',
  backgroundColor: '#f0f0f0',
  borderBottom: '2px solid #ddd',
  fontWeight: 600,
}

const td: React.CSSProperties = {
  padding: '0.55rem 0.75rem',
  borderBottom: '1px solid #eee',
  verticalAlign: 'middle',
}

function quantityColor(qty: number): string {
  if (qty === 0) return '#c00'
  if (qty < 5) return '#b8800a'
  return 'inherit'
}

export function InventoryTable({ stocks, isLoading, isError, onRetry }: Props) {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Cargando inventario"
        style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        Cargando inventario…
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ padding: '1.5rem', color: '#c00' }}>
        <p style={{ margin: '0 0 0.75rem' }}>Error al cargar el inventario.</p>
        <button onClick={onRetry}>Reintentar</button>
      </div>
    )
  }

  if (stocks.length === 0) {
    return <p style={{ color: '#666', padding: '1.5rem 0' }}>Sin registros de inventario.</p>
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
      <thead>
        <tr>
          <th style={th}>Producto</th>
          <th style={th}>Almacén</th>
          <th style={th}>Cantidad</th>
        </tr>
      </thead>
      <tbody>
        {stocks.map((s) => (
          <tr key={`${s.productId}-${s.warehouseId}`} style={{ background: '#fff' }}>
            <td style={td}>{s.productName}</td>
            <td style={td}>{s.warehouseName}</td>
            <td style={{ ...td, fontWeight: 600, color: quantityColor(s.quantity) }}>
              {s.quantity}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
