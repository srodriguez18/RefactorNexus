interface Warehouse {
  id: number
  name: string
}

interface Props {
  warehouses: Warehouse[]
  value: number | undefined
  onChange: (id: number | undefined) => void
}

export function WarehouseFilter({ warehouses, value, onChange }: Props) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
      <span>Almacén:</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value !== '' ? Number(e.target.value) : undefined)}
        aria-label="Filtrar por almacén"
        style={{
          padding: '0.4rem 0.6rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '0.9rem',
        }}
      >
        <option value="">Todos</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
    </label>
  )
}
