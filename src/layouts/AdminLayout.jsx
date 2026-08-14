import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStoreConfig } from '../context/StoreConfigContext'

const LINKS = [
  { to: '/admin', end: true, icon: '📊', label: 'Dashboard' },
  { to: '/admin/libros', icon: '📚', label: 'Libros' },
  { to: '/admin/categorias', icon: '🏷️', label: 'Categorías' },
  { to: '/admin/autores', icon: '✍️', label: 'Autores' },
  { to: '/admin/editoriales', icon: '🏢', label: 'Editoriales' },
  { to: '/admin/pedidos', icon: '📦', label: 'Pedidos' },
  { to: '/admin/clientes', icon: '👥', label: 'Clientes' },
  { to: '/admin/configuracion', icon: '⚙️', label: 'Configuración' },
]

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-primary-600/20 text-primary-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'
  }`

/**
 * Shell del panel administrativo: sidebar oscuro con navegación por módulo, responsive
 * (drawer off-canvas en móvil, fijo en desktop) — a diferencia del panel de DemoPV, que
 * era desktop-only, aquí sí se valida el uso completo desde pantallas pequeñas (Fase 14).
 */
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { config } = useStoreConfig()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold text-white">
              {(config?.storeName || 'L')[0]}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-white leading-tight">{config?.storeName || 'Librería Online'}</p>
            <p className="text-xs text-slate-400">Panel administrativo</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={navLinkClass} onClick={() => setDrawerOpen(false)}>
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <NavLink to="/" className="block text-xs text-slate-400 hover:text-white mb-2">← Volver a la tienda</NavLink>
        <p className="text-xs text-slate-500 mb-2">{user?.firstName} {user?.lastName}</p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden lg:flex w-64 bg-gray-900 flex-col shrink-0">{sidebarContent}</aside>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <aside className="relative w-64 bg-gray-900 flex flex-col h-full">{sidebarContent}</aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3">
          <button onClick={() => setDrawerOpen(true)} className="p-2 text-gray-600" aria-label="Abrir menú">☰</button>
          <span className="font-semibold text-gray-800">Panel administrativo</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
