import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotifyContext'
import { updateMe } from '../api/users'

export default function MyProfile() {
  const { user, updateUserInMemory } = useAuth()
  const { notify } = useNotify()
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateMe(form)
      updateUserInMemory(res.data.data)
      notify('Perfil actualizado', 'success')
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo actualizar tu perfil', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-app py-6 sm:py-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi perfil</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <label className="block text-sm">
          <span className="block text-gray-700 mb-1 font-medium">Correo electrónico</span>
          <input disabled value={user?.email || ''} className="input bg-gray-100 text-gray-500" />
        </label>
        <label className="block text-sm">
          <span className="block text-gray-700 mb-1 font-medium">Nombre</span>
          <input required className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="block text-gray-700 mb-1 font-medium">Apellido</span>
          <input required className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="block text-gray-700 mb-1 font-medium">Teléfono</span>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
