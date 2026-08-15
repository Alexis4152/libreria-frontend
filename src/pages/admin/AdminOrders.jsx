import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { adminListOrders } from '../../api/orders'
import { formatCurrency, formatDate } from '../../utils/format'
import AdminPagination from '../../components/AdminPagination'

const STATUSES = ['', 'PENDIENTE', 'PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

const STATUS_STYLES = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  PAGADO: 'bg-blue-100 text-blue-800',
  PREPARANDO: 'bg-indigo-100 text-indigo-800',
  ENVIADO: 'bg-purple-100 text-purple-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

export default function AdminOrders() {
  const [params, setParams] = useSearchParams()
  const statusFromUrl = params.get('status') || ''

  const [filters, setFilters] = useState({ q: '', status: statusFromUrl, dateFrom: '', dateTo: '' })
  const [appliedFilters, setAppliedFilters] = useState({ q: '', status: statusFromUrl, dateFrom: '', dateTo: '' })
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [result, setResult] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 })
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    adminListOrders({
      status: appliedFilters.status || undefined,
      q: appliedFilters.q || undefined,
      dateFrom: appliedFilters.dateFrom || undefined,
      dateTo: appliedFilters.dateTo || undefined,
      page, size,
    }).then((r) => setResult(r.data.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, size, appliedFilters])

  function handleApplyFilters(e) {
    e.preventDefault()
    setPage(0)
    setAppliedFilters(filters)
    setParams(filters.status ? { status: filters.status } : {})
  }

  function handleClearFilters() {
    const empty = { q: '', status: '', dateFrom: '', dateTo: '' }
    setFilters(empty)
    setAppliedFilters(empty)
    setPage(0)
    setParams({})
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h1>

      <form onSubmit={handleApplyFilters} className="card p-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-600 block mb-1">Folio o cliente</label>
          <input type="text" className="input" placeholder="Buscar..." value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs font-medium text-gray-600 block mb-1">Estado</label>
          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{s || 'Todos los estados'}</option>)}
          </select>
        </div>
        <div className="min-w-[150px]">
          <label className="text-xs font-medium text-gray-600 block mb-1">Fecha inicio</label>
          <input type="date" className="input" value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
        </div>
        <div className="min-w-[150px]">
          <label className="text-xs font-medium text-gray-600 block mb-1">Fecha fin</label>
          <input type="date" className="input" value={filters.dateTo} min={filters.dateFrom || undefined}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary text-sm">Filtrar</button>
          <button type="button" className="btn-secondary text-sm" onClick={handleClearFilters}>Limpiar</button>
        </div>
      </form>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <p className="text-gray-500 text-sm p-4">Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Folio</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {result.content.map((o) => (
                  <tr key={o.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{o.folio}</td>
                    <td className="px-4 py-3 text-gray-600">{o.buyerFullName}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/pedidos/${o.id}`} className="text-primary-700 hover:underline">Ver</Link>
                    </td>
                  </tr>
                ))}
                {result.content.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay pedidos con ese filtro.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination
          page={result.page} size={size} totalPages={result.totalPages} totalElements={result.totalElements}
          contentLength={result.content.length}
          onPageChange={setPage} onSizeChange={(s) => { setSize(s); setPage(0) }}
        />
      </div>
    </div>
  )
}
