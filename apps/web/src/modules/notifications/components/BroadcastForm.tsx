import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { BroadcastNotificationDto, NotificationKind } from '@legacy-nexus/shared'
import { useBroadcast } from '../hooks/useNotifications'

const schema = z.object({
  message: z.string().min(5, 'El mensaje debe tener al menos 5 caracteres'),
  kind: z.enum(['info', 'warn', 'alert', 'system', 'marketing']),
})

type FormData = z.infer<typeof schema>

const KIND_LABELS: Record<NotificationKind, string> = {
  info: 'Info',
  warn: 'Aviso',
  alert: 'Alerta',
  system: 'Sistema',
  marketing: 'Marketing',
}

const fieldStyle: React.CSSProperties = { marginBottom: '1rem' }
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.9rem' }
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.45rem 0.6rem',
  boxSizing: 'border-box',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '0.9rem',
}
const errorStyle: React.CSSProperties = { color: '#c00', fontSize: '0.8rem', marginTop: '0.2rem' }

export function BroadcastForm() {
  const broadcast = useBroadcast()
  const [successCount, setSuccessCount] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { kind: 'info' },
  })

  const onSubmit = (data: BroadcastNotificationDto) => {
    setSuccessCount(null)
    broadcast.mutate(data, {
      onSuccess: ({ count }) => {
        setSuccessCount(count)
        reset()
      },
    })
  }

  return (
    <div
      style={{
        background: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.25rem 1.5rem',
        marginTop: '1.5rem',
      }}
    >
      <h2 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Enviar broadcast</h2>

      {successCount !== null && (
        <p
          role="status"
          style={{
            color: '#1a7a1a',
            background: '#e8f5e9',
            border: '1px solid #a5d6a7',
            borderRadius: '4px',
            padding: '0.5rem 0.75rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          Notificación enviada a {successCount} usuario{successCount !== 1 ? 's' : ''}.
        </p>
      )}

      {broadcast.isError && (
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
          {broadcast.error instanceof Error ? broadcast.error.message : 'Error al enviar broadcast'}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={fieldStyle}>
          <label htmlFor="bc-message" style={labelStyle}>Mensaje</label>
          <textarea
            id="bc-message"
            rows={3}
            aria-label="Mensaje"
            style={{ ...inputStyle, resize: 'vertical' }}
            {...register('message')}
          />
          {errors.message && (
            <span role="alert" style={errorStyle}>{errors.message.message}</span>
          )}
        </div>

        <div style={fieldStyle}>
          <label htmlFor="bc-kind" style={labelStyle}>Tipo</label>
          <select id="bc-kind" aria-label="Tipo de notificación" style={inputStyle} {...register('kind')}>
            {(Object.keys(KIND_LABELS) as NotificationKind[]).map((k) => (
              <option key={k} value={k}>{KIND_LABELS[k]}</option>
            ))}
          </select>
          {errors.kind && (
            <span role="alert" style={errorStyle}>{errors.kind.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={broadcast.isPending}
          style={{
            padding: '0.5rem 1.25rem',
            background: broadcast.isPending ? '#999' : '#1a1a2e',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: broadcast.isPending ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {broadcast.isPending ? 'Enviando…' : 'Enviar a todos'}
        </button>
      </form>
    </div>
  )
}
