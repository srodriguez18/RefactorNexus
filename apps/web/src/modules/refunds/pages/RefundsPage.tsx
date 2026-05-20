import { useState } from 'react'
import type { CreateRefundDto } from '@legacy-nexus/shared'
import { useAuthContext } from '../../../context/AuthContext'
import {
  useListRefunds,
  useCreateRefund,
  useApproveRefund,
  useRejectRefund,
} from '../hooks/useRefunds'
import { RefundList } from '../components/RefundList'
import { RefundForm } from '../components/RefundForm'

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
  width: '460px',
  maxWidth: '94vw',
}

export function RefundsPage() {
  const { currentUser } = useAuthContext()
  const isAdmin = currentUser?.isAdmin ?? false

  const [showModal, setShowModal] = useState(false)
  const [backendError, setBackendError] = useState<string | null>(null)

  const listQuery = useListRefunds(currentUser?.userId)
  const createRefund = useCreateRefund()
  const approveRefund = useApproveRefund()
  const rejectRefund = useRejectRefund()

  const closeModal = () => { setShowModal(false); setBackendError(null) }

  const handleCreate = (data: CreateRefundDto) => {
    setBackendError(null)
    createRefund.mutate(data, {
      onSuccess: closeModal,
      onError: (err) =>
        setBackendError(err instanceof Error ? err.message : 'Error al solicitar reembolso'),
    })
  }

  const handleApprove = (id: number) => {
    approveRefund.mutate(id, {
      onError: (err) =>
        setBackendError(err instanceof Error ? err.message : 'Error al aprobar reembolso'),
    })
  }

  const handleReject = (id: number) => {
    rejectRefund.mutate(id, {
      onError: (err) =>
        setBackendError(err instanceof Error ? err.message : 'Error al rechazar reembolso'),
    })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Reembolsos</h1>
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
          Solicitar reembolso
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

      <RefundList
        refunds={listQuery.data ?? []}
        isLoading={listQuery.isLoading}
        isError={listQuery.isError}
        onRetry={() => listQuery.refetch()}
        isAdmin={isAdmin}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={approveRefund.isPending}
        isRejecting={rejectRefund.isPending}
      />

      {showModal && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Solicitar reembolso</h2>
              <button
                onClick={closeModal}
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

            <RefundForm onSubmit={handleCreate} isLoading={createRefund.isPending} />
          </div>
        </div>
      )}
    </div>
  )
}
