import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLogin } from '../hooks/useAuth'

const schema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const login = useLogin()

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} noValidate>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="username" style={{ display: 'block', marginBottom: '0.25rem' }}>
          Usuario
        </label>
        <input
          id="username"
          aria-label="Usuario"
          autoComplete="username"
          style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          {...register('username')}
        />
        {errors.username && (
          <span role="alert" style={{ color: '#c00', fontSize: '0.85rem' }}>
            {errors.username.message}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.25rem' }}>
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          aria-label="Contraseña"
          autoComplete="current-password"
          style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          {...register('password')}
        />
        {errors.password && (
          <span role="alert" style={{ color: '#c00', fontSize: '0.85rem' }}>
            {errors.password.message}
          </span>
        )}
      </div>

      {login.isError && (
        <p
          role="alert"
          style={{ color: '#c00', marginBottom: '1rem', fontSize: '0.9rem' }}
        >
          {login.error instanceof Error ? login.error.message : 'Credenciales inválidas'}
        </p>
      )}

      <button
        type="submit"
        disabled={login.isPending}
        style={{ width: '100%', padding: '0.625rem', cursor: login.isPending ? 'not-allowed' : 'pointer' }}
      >
        {login.isPending ? 'Cargando...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
