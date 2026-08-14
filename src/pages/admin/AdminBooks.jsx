import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListBooks, adminDeactivateBook } from '../../api/books'
import { getCategories } from '../../api/catalog'
import { formatCurrency } from '../../utils/format'
import { useNotify } from '../../context/NotifyContext'
import AdminPagination from '../../components/AdminPagination'

const EMPTY_FILTERS = { q: '', categoryId: '' }

export default function AdminBooks() {
  const { notify, confirmDialog } = useNotify()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [categories, setCategories] = useState([])
  const [result, setResult] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 })
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    adminListBooks({
      q: appliedFilters.q || undefined,
      categoryId: appliedFilters.categoryId || undefined,
      page, size,
    }).then((r) => setResult(r.data.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, size, appliedFilters])
  useEffect(() => { getCategories().then((r) => setCategories(r.data.data)) }, [])

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

  async function handleDeactivate(id, title) {
    const ok = await confirmDialog(`¿Desactivar "${title}"? Ya no será visible en la tienda.`, { confirmText: 'Desactivar' })
    if (!ok) return
    try {
      await adminDeactivateBook(id)
      notify('Libro desactivado', 'success')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo desactivar', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Libros</h1>
        <Link to="/admin/libros/nuevo" className="btn-primary text-sm">+ Nuevo libro</Link>
      </div>

      <form onSubmit={handleApplyFilters} className="card p-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-600 block mb-1">Título o SKU</label>
          <input type="text" className="input" placeholder="Buscar..." value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs font-medium text-gray-600 block mb-1">Categoría</label>
          <select className="input" value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
            <option value="">Todas</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium text-right">Precio</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {result.content.map((b) => (
                  <tr key={b.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{b.title}</p>
                      <p className="text-xs text-gray-500">{b.authorNames}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.sku}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(b.promoPrice ?? b.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={b.stock <= 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>{b.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link to={`/admin/libros/${b.id}`} className="text-primary-700 hover:underline mr-3">Editar</Link>
                      <button onClick={() => handleDeactivate(b.id, b.title)} className="text-red-600 hover:underline">Desactivar</button>
                    </td>
                  </tr>
                ))}
                {result.content.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin libros</td></tr>
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
