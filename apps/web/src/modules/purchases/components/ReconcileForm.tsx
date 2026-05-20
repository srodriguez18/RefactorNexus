import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ReconcileDto } from '@legacy-nexus/shared'

const schema = z.object({
  bankRef: z.string().min(3, 'Mínimo 3 caracteres'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: ReconcileDto) => void
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

export function ReconcileForm({ onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={fieldStyle}>
        <label htmlFor="rc-bankref" style={labelStyle}>Referencia bancaria</label>
        <input
          id="rc-bankref"
          type="text"
          aria-label="Referencia bancaria"
          style={inputStyle}
          {...register('bankRef')}
        />
        {errors.bankRef && (
          <span role="alert" style={errorStyle}>{errors.bankRef.message}</span>
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
        {isLoading ? 'Guardando…' : 'Confirmar reconciliación'}
      </button>
    </form>
  )
}
