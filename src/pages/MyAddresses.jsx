import { useEffect, useState } from 'react'
import { getMyAddresses, createAddress, updateAddress, deleteAddress } from '../api/users'
import { useNotify } from '../context/NotifyContext'

const EMPTY = {
  label: '', recipientName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', postalCode: '', country: 'México', defaultAddress: false,
}

export default function MyAddresses() {
  const { notify, confirmDialog } = useNotify()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    getMyAddresses().then((r) => setAddresses(r.data.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  function openEdit(address) {
    setEditingId(address.id)
    setForm({ ...address })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await updateAddress(editingId, form)
      } else {
        await createAddress(form)
      }
      notify('Dirección guardada', 'success')
      setModalOpen(false)
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo guardar la dirección', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const ok = await confirmDialog('¿Eliminar esta dirección?', { confirmText: 'Eliminar' })
    if (!ok) return
    try {
      await deleteAddress(id)
      notify('Dirección eliminada', 'success')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo eliminar', 'error')
    }
  }

  return (
    <div className="container-app py-6 sm:py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis direcciones</h1>
        <button onClick={openCreate} className="btn-primary text-sm">+ Nueva dirección</button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : addresses.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No tienes direcciones guardadas.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="card p-4 flex items-start justify-between gap-4">
              <div className="text-sm">
                <p className="font-semibold text-gray-900">
                  {a.label && <span className="text-primary-700">[{a.label}] </span>}
                  {a.recipientName} {a.defaultAddress && <span className="ml-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">Predeterminada</span>}
                </p>
                <p className="text-gray-600">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</p>
                <p className="text-gray-600">{a.city}, {a.state} {a.postalCode}</p>
                <p className="text-gray-600">{a.phone}</p>
              </div>
              <div className="flex gap-3 text-sm shrink-0">
                <button onClick={() => openEdit(a)} className="text-primary-700 hover:underline">Editar</button>
                <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Editar dirección' : 'Nueva dirección'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Etiqueta (opcional)">
                <input className="input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Casa, Oficina..." />
              </Field>
              <Field label="Nombre del destinatario">
                <input required className="input" value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
              </Field>
              <Field label="Teléfono">
                <input required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Dirección">
                <input required className="input" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
              </Field>
              <Field label="Referencias (opcional)">
                <input className="input" value={form.addressLine2} onChange={(e) => setForm({ ...form, addressLine2: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ciudad">
                  <input required className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Field>
                <Field label="Estado">
                  <input required className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </Field>
                <Field label="Código postal">
                  <input required className="input" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                </Field>
                <Field label="País">
                  <input required className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.defaultAddress} onChange={(e) => setForm({ ...form, defaultAddress: e.target.checked })} />
                Usar como dirección predeterminada
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

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="block text-gray-700 mb-1 font-medium">{label}</span>
      {children}
    </label>
  )
}
