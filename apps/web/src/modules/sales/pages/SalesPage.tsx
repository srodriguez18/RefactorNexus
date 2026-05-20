import { useState } from 'react'
import type { CreateSaleDto, SaleSummary } from '@legacy-nexus/shared'
import { useAuthContext } from '../../../context/AuthContext'
import { useSaleHistory, useCreateSale, useReturnSale } from '../hooks/useSales'
import { SaleForm } from '../components/SaleForm'
import { SaleHistory } from '../components/SaleHistory'
import { SaleSummaryCard } from '../components/SaleSummaryCard'

type Tab = 'new' | 'history'

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.5rem 1.25rem',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  borderBottom: active ? '2px solid #1a1a2e' : '2px solid transparent',
  fontWeight: active ? 600 : 400,
  color: active ? '#1a1a2e' : '#666',
  fontSize: '0.95rem',
})

export function SalesPage() {
  const { currentUser } = useAuthContext()
  const [tab, setTab] = useState<Tab>('new')
  const [lastSummary, setLastSummary] = useState<SaleSummary | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)

  const historyQuery = useSaleHistory(currentUser?.userId)
  const createSale = useCreateSale()
  const returnSale = useReturnSale()

  const handleCreate = (data: CreateSaleDto) => {
    setBackendError(null)
    createSale.mutate(data, {
      onSuccess: (summary) => {
        setLastSummary(summary)
        setTab('history')
      },
      onError: (err) => {
        setBackendError(err instanceof Error ? err.message : 'Error al registrar venta')
      },
    })
  }

  const handleReturn = (saleId: number) => {
    if (!window.confirm('¿Confirmar devolución de esta venta?')) return
    returnSale.mutate(saleId, {
      onError: (err) => {
        setBackendError(err instanceof Error ? err.message : 'Error al procesar devolución')
      },
    })
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 1.25rem', fontSize: '1.4rem' }}>Ventas</h1>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '1.5rem' }}>
        <button style={tabStyle(tab === 'new')} onClick={() => { setTab('new'); setBackendError(null) }}>
          Nueva venta
        </button>
        <button style={tabStyle(tab === 'history')} onClick={() => { setTab('history'); setBackendError(null) }}>
          Historial
        </button>
      </div>

      {backendError && (
        <p
          role="alert"
          style={{
            color: '#c00',
            background: '#fff0f0',
            border: '1px solid #f5c6c6',
            borderRadius: '4px',
            padding: '0.5rem 0.75rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          {backendError}
        </p>
      )}

      {tab === 'new' && (
        <div style={{ maxWidth: '520px' }}>
          <SaleForm onSubmit={handleCreate} isLoading={createSale.isPending} />
        </div>
      )}

      {tab === 'history' && (
        <>
          {lastSummary && (
            <SaleSummaryCard summary={lastSummary} onClose={() => setLastSummary(null)} />
          )}
          <SaleHistory
            sales={historyQuery.data ?? []}
            isLoading={historyQuery.isLoading}
            isError={historyQuery.isError}
            onRetry={() => historyQuery.refetch()}
            onReturn={handleReturn}
            isReturning={returnSale.isPending}
          />
        </>
      )}
    </div>
  )
}
