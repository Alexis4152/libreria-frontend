import { useEffect, useState } from 'react'
import { adminListPublishers, adminCreatePublisher, adminUpdatePublisher, adminDeletePublisher } from '../../api/catalog'
import { useNotify } from '../../context/NotifyContext'
import AdminPagination from '../../components/AdminPagination'

const EMPTY = { name: '' }
const EMPTY_FILTERS = { q: '' }

export default function AdminPublishers() {
  const { notify, confirmDialog } = useNotify()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const [result, setResult] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 })
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    adminListPublishers({ q: appliedFilters.q || undefined, page, size })
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

  function openCreate() { setEditingId(null); setForm(EMPTY); setModalOpen(true) }
  function openEdit(p) { setEditingId(p.id); setForm({ name: p.name }); setModalOpen(true) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) await adminUpdatePublisher(editingId, form)
      else await adminCreatePublisher(form)
      notify('Editorial guardada', 'success')
      setModalOpen(false)
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p) {
    const ok = await confirmDialog(`¿Desactivar la editorial "${p.name}"?`, { confirmText: 'Desactivar' })
    if (!ok) return
    try {
      await adminDeletePublisher(p.id)
      notify('Editorial desactivada', 'success')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo desactivar', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editoriales</h1>
        <button onClick={openCreate} className="btn-primary text-sm">+ Nueva editorial</button>
      </div>

      <form onSubmit={handleApplyFilters} className="card p-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-600 block mb-1">Nombre</label>
          <input type="text" className="input" placeholder="Buscar por nombre..." value={filters.q}
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
            <table className="w-full text-sm min-w-[420px]">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr><th className="px-4 py-3 font-medium">Nombre</th><th className="px-4 py-3"></th></tr>
              </thead>
              <tbody>
                {result.content.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(p)} className="text-primary-700 hover:underline mr-3">Editar</button>
                      <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline">Desactivar</button>
                    </td>
                  </tr>
                ))}
                {result.content.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-400">Sin editoriales</td></tr>
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Editar editorial' : 'Nueva editorial'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block text-sm">
                <span className="block text-gray-700 mb-1 font-medium">Nombre</span>
                <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
