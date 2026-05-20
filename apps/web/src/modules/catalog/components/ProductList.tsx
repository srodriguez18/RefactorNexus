import type { Product } from '@legacy-nexus/shared'
import { useCurrentUser } from '../../auth/hooks/useAuth'

interface Props {
  products: Product[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onDelete: (id: number) => void
}

const td: React.CSSProperties = {
  padding: '0.55rem 0.75rem',
  borderBottom: '1px solid #eee',
  verticalAlign: 'middle',
}

export function ProductList({ products, isLoading, isError, onRetry, onDelete }: Props) {
  const user = useCurrentUser()

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Cargando productos"
        style={{ padding: '2rem', textAlign: 'center', color: '#666' }}
      >
        <span>Cargando productos…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ padding: '1.5rem', color: '#c00' }}>
        <p style={{ margin: '0 0 0.75rem' }}>Error al cargar los productos.</p>
        <button onClick={onRetry}>Reintentar</button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <p style={{ color: '#666', padding: '1.5rem 0' }}>No hay productos registrados.</p>
    )
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Categoría</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id} style={{ background: '#fff' }}>
            <td style={td}>{p.sku}</td>
            <td style={td}>{p.name}</td>
            <td style={td}>
              {p.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
            </td>
            <td style={td}>{p.category ?? '—'}</td>
            <td style={td}>
              {user?.isAdmin && (
                <button
                  onClick={() => onDelete(p.id)}
                  style={{
                    padding: '0.25rem 0.6rem',
                    background: '#c00',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Eliminar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
