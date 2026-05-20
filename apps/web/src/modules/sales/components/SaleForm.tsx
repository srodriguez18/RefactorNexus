import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMemo } from 'react'
import { calculateSaleTotal } from '@legacy-nexus/finance'
import type { CreateSaleDto } from '@legacy-nexus/shared'
import { useListProducts } from '../../catalog/hooks/useProducts'

const itemSchema = z.object({
  productId: z.number({ invalid_type_error: 'Requerido' }).int().positive('ID inválido'),
  quantity: z.number({ invalid_type_error: 'Requerido' }).int().positive('Debe ser > 0'),
})

const schema = z.object({
  customerType: z.enum(['NORMAL', 'LEGACY_A']),
  items: z.array(itemSchema).min(1, 'Agrega al menos un artículo'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: CreateSaleDto) => void
  isLoading: boolean
}

const fieldStyle: React.CSSProperties = { marginBottom: '0.75rem' }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.85rem' }
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.4rem 0.6rem',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '0.9rem',
}
const errorStyle: React.CSSProperties = { color: '#c00', fontSize: '0.8rem', marginTop: '0.2rem' }
const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function SaleForm({ onSubmit, isLoading }: Props) {
  const productsQuery = useListProducts()
  const products = productsQuery.data ?? []

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { customerType: 'NORMAL', items: [{ productId: 0, quantity: 1 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const watchedItems = useWatch({ control, name: 'items' })
  const watchedCustomerType = useWatch({ control, name: 'customerType' })

  const preview = useMemo(() => {
    const resolved = watchedItems.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return { quantity: item.quantity || 0, unitPrice: product?.price ?? 0 }
    })
    return calculateSaleTotal({ items: resolved, customerType: watchedCustomerType })
  }, [watchedItems, watchedCustomerType, products])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={fieldStyle}>
        <label htmlFor="sale-customer-type" style={labelStyle}>Tipo de cliente</label>
        <select id="sale-customer-type" style={inputStyle} {...register('customerType')}>
          <option value="NORMAL">Normal</option>
          <option value="LEGACY_A">Legacy A (15% desc. adicional)</option>
        </select>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>Artículos</span>
        {typeof errors.items?.message === 'string' && (
          <span role="alert" style={{ ...errorStyle, marginLeft: '0.5rem' }}>{errors.items.message}</span>
        )}
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr auto',
            gap: '0.5rem',
            alignItems: 'start',
            marginBottom: '0.5rem',
          }}
        >
          <div>
            <select
              aria-label={`Producto ${index + 1}`}
              style={inputStyle}
              {...register(`items.${index}.productId`, { valueAsNumber: true })}
            >
              <option value={0}>— Selecciona producto —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({fmt.format(p.price)})
                </option>
              ))}
            </select>
            {errors.items?.[index]?.productId && (
              <span role="alert" style={errorStyle}>{errors.items[index]!.productId!.message}</span>
            )}
          </div>

          <div>
            <input
              type="number"
              min="1"
              aria-label={`Cantidad ${index + 1}`}
              style={inputStyle}
              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
            />
            {errors.items?.[index]?.quantity && (
              <span role="alert" style={errorStyle}>{errors.items[index]!.quantity!.message}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
            aria-label="Eliminar artículo"
            style={{
              padding: '0.4rem 0.6rem',
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: fields.length === 1 ? 'not-allowed' : 'pointer',
              color: '#888',
              marginTop: '1px',
            }}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ productId: 0, quantity: 1 })}
        style={{
          fontSize: '0.85rem',
          padding: '0.3rem 0.75rem',
          background: 'none',
          border: '1px dashed #aaa',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1.25rem',
        }}
      >
        + Agregar artículo
      </button>

      {/* Real-time total preview */}
      <div
        style={{
          background: '#f5f5ff',
          border: '1px solid #d0d0f0',
          borderRadius: '6px',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.9rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>Subtotal</span><span>{fmt.format(preview.subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#b8800a' }}>
          <span>Descuento</span><span>−{fmt.format(preview.discount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Total (IVA inc.)</span><span>{fmt.format(preview.total)}</span>
        </div>
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
        {isLoading ? 'Registrando…' : 'Registrar venta'}
      </button>
    </form>
  )
}
