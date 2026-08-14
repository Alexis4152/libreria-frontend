import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useStoreConfig } from '../context/StoreConfigContext'
import { getCategories } from '../api/catalog'

export default function Header() {
  const { user, isAdmin, logout } = useAuth()
  const { itemCount } = useCart()
  const { config } = useStoreConfig()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function submitSearch(e) {
    e.preventDefault()
    navigate(query.trim() ? `/catalogo?q=${encodeURIComponent(query.trim())}` : '/catalogo')
    setMobileOpen(false)
  }

  function handleLogout() {
    logout()
    setAccountOpen(false)
    navigate('/')
  }

  return (
    <header className="print:hidden sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="container-app flex items-center gap-4 py-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt={config.storeName} className="h-9 w-auto object-contain" />
          ) : (
            <span className="text-xl font-bold text-primary-700">{config?.storeName || 'Librería Online'}</span>
          )}
        </Link>

        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-xl">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, autor, ISBN..."
            className="input rounded-r-none"
          />
          <button type="submit" className="btn-primary rounded-l-none px-4" aria-label="Buscar">
            🔍
          </button>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Buscar"
          >
            🔍
          </button>

          <div className="relative hidden sm:block" ref={accountRef}>
            {user ? (
              <>
                <button
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-700"
                  onClick={() => setAccountOpen((v) => !v)}
                >
                  👤 {user.firstName}
                </button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 text-sm">
                    <Link to="/mis-pedidos" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setAccountOpen(false)}>
                      Mis pedidos
                    </Link>
                    <Link to="/mi-cuenta" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setAccountOpen(false)}>
                      Mi perfil
                    </Link>
                    <Link to="/mis-direcciones" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setAccountOpen(false)}>
                      Mis direcciones
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 hover:bg-gray-50 text-primary-700 font-medium" onClick={() => setAccountOpen(false)}>
                        Panel administrativo
                      </Link>
                    )}
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600" onClick={handleLogout}>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 text-sm font-medium">
                <Link to="/login" className="text-gray-700 hover:text-primary-700">Iniciar sesión</Link>
                <Link to="/registro" className="btn-primary py-1.5 px-3">Registrarme</Link>
              </div>
            )}
          </div>

          <Link to="/carrito" className="relative p-2 text-gray-700 hover:text-primary-700" aria-label="Carrito">
            🛒
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <form onSubmit={submitSearch} className="md:hidden container-app pb-3 flex">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar libros..."
            className="input rounded-r-none"
            autoFocus
          />
          <button type="submit" className="btn-primary rounded-l-none px-4">🔍</button>
        </form>
      )}

      <nav className="border-t border-gray-100 bg-gray-50">
        <div className="container-app flex items-center gap-4 py-2 overflow-x-auto text-sm whitespace-nowrap">
          <Link to="/catalogo" className="font-medium text-gray-700 hover:text-primary-700">Todos los libros</Link>
          {categories.map((c) => (
            <Link key={c.id} to={`/catalogo?categoryId=${c.id}`} className="text-gray-600 hover:text-primary-700">
              {c.name}
            </Link>
          ))}
          {!user && (
            <Link to="/login" className="sm:hidden text-gray-600 hover:text-primary-700 ml-auto">Iniciar sesión</Link>
          )}
        </div>
      </nav>
    </header>
  )
}
