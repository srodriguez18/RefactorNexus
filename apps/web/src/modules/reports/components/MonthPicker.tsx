const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface Props {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

const selectStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '0.9rem',
}

export function MonthPicker({ year, month, onChange }: Props) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>
        Año:
        <select
          value={year}
          onChange={(e) => onChange(Number(e.target.value), month)}
          style={{ ...selectStyle, marginLeft: '0.4rem' }}
          aria-label="Año"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>

      <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>
        Mes:
        <select
          value={month}
          onChange={(e) => onChange(year, Number(e.target.value))}
          style={{ ...selectStyle, marginLeft: '0.4rem' }}
          aria-label="Mes"
        >
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
