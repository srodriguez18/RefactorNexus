import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

const loginState = {
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null as Error | null,
}

vi.mock('../hooks/useAuth', () => ({
  useLogin: () => loginState,
}))

beforeEach(() => {
  loginState.mutate = vi.fn()
  loginState.isPending = false
  loginState.isError = false
  loginState.error = null
})

describe('LoginForm', () => {
  test('renderiza campos de usuario y contraseña', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  test('muestra errores de validación al enviar vacío', async () => {
    render(<LoginForm />)
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByText(/el usuario es requerido/i)).toBeInTheDocument()
    expect(await screen.findByText(/la contraseña es requerida/i)).toBeInTheDocument()
  })

  test('llama mutate con las credenciales al enviar el formulario', async () => {
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/usuario/i), 'admin')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(loginState.mutate).toHaveBeenCalledWith({ username: 'admin', password: 'secret' })
  })

  test('muestra mensaje de error cuando isError es true', () => {
    loginState.isError = true
    loginState.error = new Error('Credenciales incorrectas')
    render(<LoginForm />)
    expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument()
  })

  test('muestra mensaje genérico cuando error no es instancia de Error', () => {
    loginState.isError = true
    loginState.error = null
    render(<LoginForm />)
    expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
  })

  test('deshabilita el botón mientras isPending', () => {
    loginState.isPending = true
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /cargando/i })).toBeDisabled()
  })
})
