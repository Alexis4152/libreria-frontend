import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Guard de rutas autenticadas. `adminOnly` restringe además a usuarios con rol ADMIN
 * (panel administrativo) — la protección real sigue estando en el Backend
 * (`SecurityConfig` + `@PreAuthorize`/`hasRole`), esto solo evita el parpadeo de UI.
 */
export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Cargando...</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}
