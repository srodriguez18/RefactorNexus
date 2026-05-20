import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { LoginPage } from './modules/auth/pages/LoginPage'
import { useLogout } from './modules/auth/hooks/useAuth'
import { CatalogPage } from './modules/catalog/pages/CatalogPage'
import { InventoryPage } from './modules/inventory/pages/InventoryPage'

const queryClient = new QueryClient()

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1.25rem',
  alignItems: 'center',
  padding: '0.75rem 1.5rem',
  backgroundColor: '#1a1a2e',
  color: '#fff',
}

const linkStyle: React.CSSProperties = { color: '#e0e0ff', textDecoration: 'none' }

function AppNav() {
  const logout = useLogout()
  return (
    <nav style={navStyle}>
      <span style={{ fontWeight: 600, marginRight: 'auto' }}>Legacy Nexus</span>
      <Link to="/catalog" style={linkStyle}>Catálogo</Link>
      <Link to="/inventory" style={linkStyle}>Inventario</Link>
      <Link to="/sales" style={linkStyle}>Ventas</Link>
      <button
        onClick={logout}
        style={{
          marginLeft: 'auto',
          cursor: 'pointer',
          background: 'transparent',
          color: '#e0e0ff',
          border: '1px solid #e0e0ff',
          borderRadius: '4px',
          padding: '0.25rem 0.75rem',
        }}
      >
        Cerrar sesión
      </button>
    </nav>
  )
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token, isInitialized } = useAuthContext()
  if (!isInitialized) return null
  if (!token) return <Navigate to="/login" replace />
  return (
    <>
      <AppNav />
      <main style={{ padding: '1.5rem' }}>{children}</main>
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/catalog"
        element={<ProtectedLayout><CatalogPage /></ProtectedLayout>}
      />
      <Route
        path="/inventory"
        element={<ProtectedLayout><InventoryPage /></ProtectedLayout>}
      />
      <Route
        path="/sales"
        element={<ProtectedLayout><div>Ventas — próximamente</div></ProtectedLayout>}
      />
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="*" element={<Navigate to="/catalog" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
