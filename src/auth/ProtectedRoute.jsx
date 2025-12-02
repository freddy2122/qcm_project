import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-6 text-center">Chargement...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.is_admin) return <Navigate to="/admin" replace />
  return <Outlet />
}
