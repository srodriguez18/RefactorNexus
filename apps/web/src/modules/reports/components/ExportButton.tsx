import { useState } from 'react'
import { useExportCSV } from '../hooks/useReports'

interface Props {
  year: number
  month: number
}

export function ExportButton({ year, month }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const download = useExportCSV()

  const handleClick = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await download(year, month)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
      <button
        onClick={handleClick}
        disabled={isLoading}
        style={{
          padding: '0.5rem 1rem',
          background: isLoading ? '#999' : '#2e7d32',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        {isLoading ? 'Exportando…' : 'Exportar CSV'}
      </button>
      {error && (
        <span role="alert" style={{ fontSize: '0.8rem', color: '#c00' }}>{error}</span>
      )}
    </div>
  )
}
