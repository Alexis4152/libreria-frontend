import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../api/orders'
import { formatCurrency, formatDate } from '../utils/format'
import Pagination from '../components/Pagination'

const STATUS_STYLES = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  PAGADO: 'bg-blue-100 text-blue-800',
  PREPARANDO: 'bg-indigo-100 text-indigo-800',
  ENVIADO: 'bg-purple-100 text-purple-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

export default function MyOrders() {
  const [result, setResult] = useState({ content: [], page: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)

  function load(page = 0) {
    setLoading(true)
    getMyOrders({ page }).then((r) => setResult(r.data.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load(0) }, [])

  return (
    <div className="container-app py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis pedidos</h1>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : result.content.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Aún no has realizado ningún pedido.</p>
          <Link to="/catalogo" className="btn-primary inline-block">Ir al catálogo</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {result.content.map((o) => (
              <Link key={o.id} to={`/mis-pedidos/${o.id}`} className="card p-4 flex flex-wrap items-center justify-between gap-3 hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold text-gray-900">Folio {o.folio}</p>
                  <p className="text-xs text-gray-500">{formatDate(o.createdAt)} · {o.itemCount} artículo(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-700'}`}>
                    {o.status}
                  </span>
                  <span className="font-bold text-gray-900">{formatCurrency(o.total)}</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={result.page} totalPages={result.totalPages} onChange={load} />
        </>
      )}
    </div>
  )
}
