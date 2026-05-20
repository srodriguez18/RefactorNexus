import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../../context/AuthContext'

interface LoginCredentials {
  username: string
  password: string
}

export function useLogin() {
  const { login } = useAuthContext()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: () => navigate('/catalog'),
  })
}

export function useCurrentUser() {
  const { currentUser } = useAuthContext()
  return currentUser
}

export function useLogout() {
  const { logout } = useAuthContext()
  return logout
}
