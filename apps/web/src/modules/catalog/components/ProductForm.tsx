import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CreateProductDto } from '@legacy-nexus/shared'

const schema = z.object({
  sku: z.string().min(1, 'El SKU es requerido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z
    .number({ invalid_type_error: 'El precio debe ser un número' })
    .positive('El precio debe ser positivo'),
  category: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: CreateProductDto) => void
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

export function ProductForm({ onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={fieldStyle}>
        <label htmlFor="pf-sku" style={labelStyle}>SKU</label>
        <input id="pf-sku" aria-label="SKU" style={inputStyle} {...register('sku')} />
        {errors.sku && <span role="alert" style={errorStyle}>{errors.sku.message}</span>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="pf-name" style={labelStyle}>Nombre</label>
        <input id="pf-name" aria-label="Nombre" style={inputStyle} {...register('name')} />
        {errors.name && <span role="alert" style={errorStyle}>{errors.name.message}</span>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="pf-description" style={labelStyle}>Descripción</label>
        <input
          id="pf-description"
          aria-label="Descripción"
          style={inputStyle}
          {...register('description')}
        />
      </div>

      <div style={fieldStyle}>
        <label htmlFor="pf-price" style={labelStyle}>Precio</label>
        <input
          id="pf-price"
          type="number"
          step="0.01"
          min="0"
          aria-label="Precio"
          style={inputStyle}
          {...register('price', { valueAsNumber: true })}
        />
        {errors.price && <span role="alert" style={errorStyle}>{errors.price.message}</span>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="pf-category" style={labelStyle}>Categoría</label>
        <input
          id="pf-category"
          aria-label="Categoría"
          style={inputStyle}
          {...register('category')}
        />
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
        {isLoading ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  )
}
