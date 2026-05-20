import { useState } from 'react'
import type { CreatePurchaseDto, Purchase, ReconcileDto } from '@legacy-nexus/shared'
import { useAuthContext } from '../../../context/AuthContext'
import { useListPurchases, useCreatePurchase, useReconcile } from '../hooks/usePurchases'
import { PurchaseList } from '../components/PurchaseList'
import { PurchaseForm } from '../components/PurchaseForm'
import { ReconcileForm } from '../components/ReconcileForm'

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
  width: '560px',
  maxWidth: '94vw',
  maxHeight: '90vh',
  overflowY: 'auto',
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h2>
      <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  )
}

type Modal = { type: 'create' } | { type: 'reconcile'; purchase: Purchase }

export function PurchasesPage() {
  const { currentUser } = useAuthContext()
  const isAdmin = currentUser?.isAdmin ?? false

  const [modal, setModal] = useState<Modal | null>(null)
  const [backendError, setBackendError] = useState<string | null>(null)

  const listQuery = useListPurchases()
  const createPurchase = useCreatePurchase()
  const reconcile = useReconcile()

  const closeModal = () => { setModal(null); setBackendError(null) }

  const handleCreate = (data: CreatePurchaseDto) => {
    setBackendError(null)
    createPurchase.mutate(data, {
      onSuccess: closeModal,
      onError: (err) => setBackendError(err instanceof Error ? err.message : 'Error al registrar compra'),
    })
  }

  const handleReconcile = (data: ReconcileDto) => {
    if (modal?.type !== 'reconcile') return
    setBackendError(null)
    reconcile.mutate(
      { id: modal.purchase.id, data },
      {
        onSuccess: closeModal,
        onError: (err) => setBackendError(err instanceof Error ? err.message : 'Error al reconciliar'),
      },
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Compras</h1>
        <button
          onClick={() => { setBackendError(null); setModal({ type: 'create' }) }}
          style={{
            padding: '0.5rem 1rem',
            background: '#1a1a2e',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Nueva compra
        </button>
      </div>

      <PurchaseList
        purchases={listQuery.data ?? []}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        onRetry={() => listQuery.refetch()}
        isAdmin={isAdmin}
        onReconcile={(purchase) => { setBackendError(null); setModal({ type: 'reconcile', purchase }) }}
      />

      {/* Modals */}
      {modal !== null && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <ModalHeader
              title={modal.type === 'create' ? 'Nueva compra' : `Reconciliar compra #${modal.purchase.id}`}
              onClose={closeModal}
            />

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

            {modal.type === 'create' && (
              <PurchaseForm onSubmit={handleCreate} isLoading={createPurchase.isPending} />
            )}
            {modal.type === 'reconcile' && (
              <ReconcileForm onSubmit={handleReconcile} isLoading={reconcile.isPending} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
