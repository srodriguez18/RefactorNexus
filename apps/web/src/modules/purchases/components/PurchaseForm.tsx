import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CreatePurchaseDto } from '@legacy-nexus/shared'
import { useListSuppliers } from '../hooks/usePurchases'
import { useListProducts } from '../../catalog/hooks/useProducts'

const itemSchema = z.object({
  productId: z.number({ invalid_type_error: 'Requerido' }).int().positive('ID inválido'),
  quantity: z.number({ invalid_type_error: 'Requerido' }).int().positive('Debe ser > 0'),
  unitCost: z.number({ invalid_type_error: 'Requerido' }).positive('Debe ser > 0'),
})

const schema = z.object({
  supplierId: z.number({ invalid_type_error: 'Selecciona un proveedor' }).int().positive('Selecciona un proveedor'),
  receivedDate: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Agrega al menos un artículo'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: CreatePurchaseDto) => void
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

export function PurchaseForm({ onSubmit, isLoading }: Props) {
  const suppliersQuery = useListSuppliers()
  const productsQuery = useListProducts()
  const suppliers = suppliersQuery.data ?? []
  const products = productsQuery.data ?? []

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { items: [{ productId: 0, quantity: 1, unitCost: 0 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = useWatch({ control, name: 'items' })

  const grandTotal = (watchedItems ?? []).reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0),
    0,
  )

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      supplierId: data.supplierId,
      items: data.items,
      receivedDate: data.receivedDate || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div style={fieldStyle}>
        <label htmlFor="pu-supplier" style={labelStyle}>Proveedor</label>
        <select
          id="pu-supplier"
          style={inputStyle}
          {...register('supplierId', { valueAsNumber: true })}
        >
          <option value={0}>— Selecciona proveedor —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.supplierId && (
          <span role="alert" style={errorStyle}>{errors.supplierId.message}</span>
        )}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="pu-date" style={labelStyle}>Fecha de recepción (opcional)</label>
        <input
          id="pu-date"
          type="date"
          style={inputStyle}
          {...register('receivedDate')}
        />
      </div>

      {/* Items */}
      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>Artículos</span>
        {typeof errors.items?.message === 'string' && (
          <span role="alert" style={{ ...errorStyle, marginLeft: '0.5rem' }}>{errors.items.message}</span>
        )}
      </div>

      {fields.map((field, index) => {
        const qty = watchedItems?.[index]?.quantity || 0
        const cost = watchedItems?.[index]?.unitCost || 0
        const lineTotal = qty * cost
        return (
          <div
            key={field.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr auto',
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
                <option value={0}>— Producto —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
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
                placeholder="Cant."
                style={inputStyle}
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
              />
              {errors.items?.[index]?.quantity && (
                <span role="alert" style={errorStyle}>{errors.items[index]!.quantity!.message}</span>
              )}
            </div>

            <div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                aria-label={`Costo unitario ${index + 1}`}
                placeholder="Costo"
                style={inputStyle}
                {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
              />
              {errors.items?.[index]?.unitCost && (
                <span role="alert" style={errorStyle}>{errors.items[index]!.unitCost!.message}</span>
              )}
              {lineTotal > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#555' }}>{fmt.format(lineTotal)}</span>
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
        )
      })}

      <button
        type="button"
        onClick={() => append({ productId: 0, quantity: 1, unitCost: 0 })}
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

      {/* Grand total preview */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.6rem 0.75rem',
          background: '#f5f5ff',
          border: '1px solid #d0d0f0',
          borderRadius: '6px',
          marginBottom: '1.25rem',
          fontWeight: 700,
          fontSize: '0.95rem',
        }}
      >
        <span>Total compra</span>
        <span>{fmt.format(grandTotal)}</span>
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
        {isLoading ? 'Registrando…' : 'Registrar compra'}
      </button>
    </form>
  )
}
