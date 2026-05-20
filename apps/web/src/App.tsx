import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuthContext } from './context/AuthContext'
import { LoginPage } from './modules/auth/pages/LoginPage'
import { useLogout } from './modules/auth/hooks/useAuth'
import { CatalogPage } from './modules/catalog/pages/CatalogPage'
import { InventoryPage } from './modules/inventory/pages/InventoryPage'
import { SalesPage } from './modules/sales/pages/SalesPage'
import { NotificationsPage } from './modules/notifications/pages/NotificationsPage'
import { NotificationBadge } from './modules/notifications/components/NotificationBadge'
import { PurchasesPage } from './modules/purchases/pages/PurchasesPage'
import { RefundsPage } from './modules/refunds/pages/RefundsPage'
import { ReportsPage } from './modules/reports/pages/ReportsPage'

const queryClient = new QueryClient()

function AppNav() {
  const logout = useLogout()
  const { currentUser } = useAuthContext()
  const navLink = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link nav-link--active' : 'nav-link'
  return (
    <nav className="app-nav">
      <span className="app-nav__brand">Nexus</span>
      <NavLink to="/catalog" className={navLink}>Catálogo</NavLink>
      <NavLink to="/inventory" className={navLink}>Inventario</NavLink>
      <NavLink to="/sales" className={navLink}>Ventas</NavLink>
      <NavLink to="/purchases" className={navLink}>Compras</NavLink>
      <NavLink to="/refunds" className={navLink}>Reembolsos</NavLink>
      {currentUser?.isAdmin && (
        <NavLink to="/reports" className={navLink}>Reportes</NavLink>
      )}
      <NavLink to="/notifications" className={navLink}>
        Notificaciones<NotificationBadge />
      </NavLink>
      <button className="nav-logout" onClick={logout}>Cerrar sesión</button>
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
        element={<ProtectedLayout><SalesPage /></ProtectedLayout>}
      />
      <Route
        path="/purchases"
        element={<ProtectedLayout><PurchasesPage /></ProtectedLayout>}
      />
      <Route
        path="/refunds"
        element={<ProtectedLayout><RefundsPage /></ProtectedLayout>}
      />
      <Route
        path="/notifications"
        element={<ProtectedLayout><NotificationsPage /></ProtectedLayout>}
      />
      <Route
        path="/reports"
        element={<ProtectedLayout><ReportsPage /></ProtectedLayout>}
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
