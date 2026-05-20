import { useMemo, useState } from 'react'
import type { AdjustStockDto } from '@legacy-nexus/shared'
import { useListInventory, useListByWarehouse, useAdjustStock } from '../hooks/useInventory'
import { InventoryTable } from '../components/InventoryTable'
import { WarehouseFilter } from '../components/WarehouseFilter'
import { StockAdjustmentForm } from '../components/StockAdjustmentForm'

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
}

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '8px',
  padding: '1.75rem',
  width: '420px',
  maxWidth: '92vw',
}

export function InventoryPage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)
  const [backendError, setBackendError] = useState<string | null>(null)

  const listQuery = useListInventory()
  const warehouseQuery = useListByWarehouse(selectedWarehouse)
  const adjustStock = useAdjustStock()

  const activeQuery = selectedWarehouse !== undefined ? warehouseQuery : listQuery

  // Derive unique warehouses from full list — avoids a separate /warehouses endpoint
  const warehouses = useMemo(() => {
    const seen = new Map<number, string>()
    for (const s of listQuery.data ?? []) {
      if (!seen.has(s.warehouseId)) seen.set(s.warehouseId, s.warehouseName)
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [listQuery.data])

  const handleAdjust = (data: AdjustStockDto) => {
    setBackendError(null)
    adjustStock.mutate(data, {
      onSuccess: () => setShowModal(false),
      onError: (err) => {
        setBackendError(err instanceof Error ? err.message : 'Error al ajustar stock')
      },
    })
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Inventario</h1>
        <button
          onClick={() => { setBackendError(null); setShowModal(true) }}
          style={{
            padding: '0.5rem 1rem',
            background: '#1a1a2e',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Ajustar stock
        </button>
      </div>

      {/* Warehouse filter */}
      <div style={{ marginBottom: '1.25rem' }}>
        <WarehouseFilter
          warehouses={warehouses}
          value={selectedWarehouse}
          onChange={setSelectedWarehouse}
        />
      </div>

      <InventoryTable
        stocks={activeQuery.data ?? []}
        isLoading={activeQuery.isLoading}
        isError={activeQuery.isError}
        onRetry={() => activeQuery.refetch()}
      />

      {/* Modal ajuste de stock */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Ajustar stock</h2>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Cerrar"
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {backendError && (
              <p
                role="alert"
                style={{
                  color: backendError.includes('insuficiente') ? '#b8800a' : '#c00',
                  background: backendError.includes('insuficiente') ? '#fff8e1' : '#fff0f0',
                  border: `1px solid ${backendError.includes('insuficiente') ? '#f0c040' : '#f5c6c6'}`,
                  borderRadius: '4px',
                  padding: '0.5rem 0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}
              >
                {backendError}
              </p>
            )}

            <StockAdjustmentForm onSubmit={handleAdjust} isLoading={adjustStock.isPending} />
          </div>
        </div>
      )}
    </div>
  )
}
