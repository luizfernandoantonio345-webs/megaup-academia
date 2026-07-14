import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ roles }) {
  const { user, isAuthenticated, authReady } = useAuth()

  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: '#E8342B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
