import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../../context/AuthContext'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  const { token } = useAuthContext()

  if (token) return <Navigate to="/catalog" replace />

  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <section
        style={{
          width: '320px',
          backgroundColor: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'center' }}>
          Legacy Nexus
        </h1>
        <LoginForm />
      </section>
    </main>
  )
}
