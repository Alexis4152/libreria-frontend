import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../../api/orders'
import { formatCurrency } from '../../utils/format'

export default function AdminDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboard().then((r) => setData(r.data.data))
  }, [])

  const cards = data && [
    { label: 'Libros activos', value: data.activeBooks, icon: '📚', to: '/admin/libros' },
    { label: 'Sin stock', value: data.outOfStockBooks, icon: '⚠️', to: '/admin/libros', warn: data.outOfStockBooks > 0 },
    { label: 'Pedidos totales', value: data.totalOrders, icon: '📦', to: '/admin/pedidos' },
    { label: 'Pedidos pendientes', value: data.pendingOrders, icon: '⏳', to: '/admin/pedidos?status=PENDIENTE', warn: data.pendingOrders > 0 },
    { label: 'Ventas de hoy', value: formatCurrency(data.salesToday), icon: '💰' },
    { label: 'Ventas acumuladas', value: formatCurrency(data.salesTotal), icon: '📈' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {!data ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => {
            const Wrapper = c.to ? Link : 'div'
            return (
              <Wrapper key={c.label} to={c.to} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <span className={`text-3xl ${c.warn ? '' : ''}`}>{c.icon}</span>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                  <p className={`text-sm ${c.warn ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{c.label}</p>
                </div>
              </Wrapper>
            )
          })}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/libros/nuevo" className="card p-5 text-center hover:shadow-md transition-shadow">
          <p className="text-2xl mb-1">➕</p>
          <p className="text-sm font-medium text-gray-700">Agregar libro</p>
        </Link>
        <Link to="/admin/pedidos" className="card p-5 text-center hover:shadow-md transition-shadow">
          <p className="text-2xl mb-1">📦</p>
          <p className="text-sm font-medium text-gray-700">Ver pedidos</p>
        </Link>
        <Link to="/admin/configuracion" className="card p-5 text-center hover:shadow-md transition-shadow">
          <p className="text-2xl mb-1">🎨</p>
          <p className="text-sm font-medium text-gray-700">Personalizar tienda</p>
        </Link>
      </div>
    </div>
  )
}
