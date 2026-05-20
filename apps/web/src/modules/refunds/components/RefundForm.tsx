import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { applyVAT } from '@legacy-nexus/finance'
import type { CreateRefundDto } from '@legacy-nexus/shared'
import { useSaleById } from '../hooks/useRefunds'

const schema = z.object({
  saleId: z.number({ invalid_type_error: 'Requerido' }).int().positive('ID de venta inválido'),
  reason: z.string().min(10, 'Mínimo 10 caracteres'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: CreateRefundDto) => void
  isLoading: boolean
}

const fieldStyle: React.CSSProperties = { marginBottom: '1rem' }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.25rem', fontWeight: 500 }
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.45rem 0.6rem',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '0.9rem',
}
const errorStyle: React.CSSProperties = { color: '#c00', fontSize: '0.8rem', marginTop: '0.2rem' }
const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function RefundForm({ onSubmit, isLoading }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watchedSaleId = useWatch({ control, name: 'saleId' })
  const [debouncedSaleId, setDebouncedSaleId] = useState<number | undefined>(undefined)

  useEffect(() => {
    const id = watchedSaleId > 0 ? watchedSaleId : undefined
    const timer = setTimeout(() => setDebouncedSaleId(id), 400)
    return () => clearTimeout(timer)
  }, [watchedSaleId])

  const saleQuery = useSaleById(debouncedSaleId)

  const previewAmount = saleQuery.data
    ? applyVAT(
        saleQuery.data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
      )
    : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={fieldStyle}>
        <label htmlFor="rf-sale-id" style={labelStyle}>ID de venta</label>
        <input
          id="rf-sale-id"
          type="number"
          min="1"
          aria-label="ID de venta"
          style={inputStyle}
          {...register('saleId', { valueAsNumber: true })}
        />
        {errors.saleId && (
          <span role="alert" style={errorStyle}>{errors.saleId.message}</span>
        )}

        {/* Amount preview */}
        {debouncedSaleId && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            {saleQuery.isLoading && (
              <span style={{ color: '#888' }}>Calculando monto…</span>
            )}
            {saleQuery.isError && (
              <span style={{ color: '#c00' }}>Venta no encontrada o sin acceso</span>
            )}
            {previewAmount !== null && (
              <span
                style={{
                  display: 'inline-block',
                  background: '#f0fff4',
                  border: '1px solid #a5d6a7',
                  borderRadius: '4px',
                  padding: '0.2rem 0.6rem',
                  color: '#1a7a1a',
                  fontWeight: 600,
                }}
              >
                Monto estimado: {fmt.format(previewAmount)}
              </span>
            )}
          </div>
        )}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="rf-reason" style={labelStyle}>Razón</label>
        <textarea
          id="rf-reason"
          rows={4}
          aria-label="Razón del reembolso"
          style={{ ...inputStyle, resize: 'vertical' }}
          {...register('reason')}
        />
        {errors.reason && (
          <span role="alert" style={errorStyle}>{errors.reason.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '0.6rem',
          background: isLoading ? '#999' : '#1a1a2e',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '0.95rem',
        }}
      >
        {isLoading ? 'Enviando…' : 'Solicitar reembolso'}
      </button>
    </form>
  )
}
