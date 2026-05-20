import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AdjustStockDto, MovementType } from '@legacy-nexus/shared'
import { useAuthContext } from '../../../context/AuthContext'

const schema = z.object({
  productId: z
    .number({ invalid_type_error: 'Requerido' })
    .int()
    .positive('Debe ser un ID válido'),
  warehouseId: z
    .number({ invalid_type_error: 'Requerido' })
    .int()
    .positive('Debe ser un ID válido'),
  quantity: z
    .number({ invalid_type_error: 'Requerido' })
    .int()
    .positive('La cantidad debe ser mayor a 0'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: AdjustStockDto) => void
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

const MOVEMENT_LABELS: Record<MovementType, string> = {
  IN: 'Entrada (IN)',
  OUT: 'Salida (OUT)',
  ADJUSTMENT: 'Ajuste (ADJUSTMENT)',
}

export function StockAdjustmentForm({ onSubmit, isLoading }: Props) {
  const { token } = useAuthContext()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'IN' },
  })

  if (!token) return null

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={fieldStyle}>
        <label htmlFor="adj-product" style={labelStyle}>ID Producto</label>
        <input
          id="adj-product"
          type="number"
          aria-label="ID Producto"
          style={inputStyle}
          {...register('productId', { valueAsNumber: true })}
        />
        {errors.productId && <span role="alert" style={errorStyle}>{errors.productId.message}</span>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="adj-warehouse" style={labelStyle}>ID Almacén</label>
        <input
          id="adj-warehouse"
          type="number"
          aria-label="ID Almacén"
          style={inputStyle}
          {...register('warehouseId', { valueAsNumber: true })}
        />
        {errors.warehouseId && (
          <span role="alert" style={errorStyle}>{errors.warehouseId.message}</span>
        )}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="adj-quantity" style={labelStyle}>Cantidad</label>
        <input
          id="adj-quantity"
          type="number"
          min="1"
          aria-label="Cantidad"
          style={inputStyle}
          {...register('quantity', { valueAsNumber: true })}
        />
        {errors.quantity && <span role="alert" style={errorStyle}>{errors.quantity.message}</span>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="adj-type" style={labelStyle}>Tipo de movimiento</label>
        <select
          id="adj-type"
          aria-label="Tipo de movimiento"
          style={inputStyle}
          {...register('type')}
        >
          {(Object.keys(MOVEMENT_LABELS) as MovementType[]).map((t) => (
            <option key={t} value={t}>{MOVEMENT_LABELS[t]}</option>
          ))}
        </select>
        {errors.type && <span role="alert" style={errorStyle}>{errors.type.message}</span>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '0.6rem',
          marginTop: '0.5rem',
          background: isLoading ? '#999' : '#1a1a2e',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '0.95rem',
        }}
      >
        {isLoading ? 'Guardando…' : 'Aplicar ajuste'}
      </button>
    </form>
  )
}
