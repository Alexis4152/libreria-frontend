import { useEffect, useState } from 'react'
import { adminListCustomers, adminDeactivateCustomer } from '../../api/users'
import { formatDate } from '../../utils/format'
import { useNotify } from '../../context/NotifyContext'
import AdminPagination from '../../components/AdminPagination'

const EMPTY_FILTERS = { q: '' }

export default function AdminCustomers() {
  const { notify, confirmDialog } = useNotify()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [result, setResult] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 })
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    adminListCustomers({ q: appliedFilters.q || undefined, page, size })
      .then((r) => setResult(r.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, size, appliedFilters])

  function handleApplyFilters(e) {
    e.preventDefault()
    setPage(0)
    setAppliedFilters(filters)
  }

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setPage(0)
  }

  async function handleDeactivate(c) {
    const ok = await confirmDialog(`¿Desactivar la cuenta de "${c.firstName} ${c.lastName}"?`, { confirmText: 'Desactivar' })
    if (!ok) return
    try {
      await adminDeactivateCustomer(c.id)
      notify('Cliente desactivado', 'success')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo desactivar', 'error')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Clientes</h1>

      <form onSubmit={handleApplyFilters} className="card p-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-600 block mb-1">Nombre o correo</label>
          <input type="text" className="input" placeholder="Buscar..." value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
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
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Correo</th>
                  <th className="px-4 py-3 font-medium">Registrado</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {result.content.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {c.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.isActive && (
                        <button onClick={() => handleDeactivate(c)} className="text-red-600 hover:underline">Desactivar</button>
                      )}
                    </td>
                  </tr>
                ))}
                {result.content.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin clientes</td></tr>
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
