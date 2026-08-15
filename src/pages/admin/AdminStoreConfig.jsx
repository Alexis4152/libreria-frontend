import { useEffect, useState } from 'react'
import {
  adminGetStoreConfig, adminUpdateStoreConfig, adminUploadLogo, adminUploadFavicon,
  adminGetEmailConfig, adminUpdateEmailConfig,
} from '../../api/storeConfig'
import { useNotify } from '../../context/NotifyContext'
import { useStoreConfig } from '../../context/StoreConfigContext'

function parseSocialLinks(raw) {
  try {
    const parsed = JSON.parse(raw || '{}')
    return { facebook: parsed.facebook || '', instagram: parsed.instagram || '', twitter: parsed.twitter || '' }
  } catch {
    return { facebook: '', instagram: '', twitter: '' }
  }
}

export default function AdminStoreConfig() {
  const { notify } = useNotify()
  const { reload } = useStoreConfig()
  const [form, setForm] = useState(null)
  const [social, setSocial] = useState({ facebook: '', instagram: '', twitter: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  function load() {
    setLoading(true)
    adminGetStoreConfig().then((r) => {
      setForm(r.data.data)
      setSocial(parseSocialLinks(r.data.data.socialLinks))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await adminUpdateStoreConfig({ ...form, socialLinks: JSON.stringify(social) })
      notify('Configuración actualizada', 'success')
      reload()
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      await adminUploadLogo(file)
      notify('Logo actualizado', 'success')
      reload()
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo subir el logo', 'error')
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  async function handleFaviconUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingFavicon(true)
    try {
      await adminUploadFavicon(file)
      notify('Favicon actualizado', 'success')
      reload()
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo subir el favicon', 'error')
    } finally {
      setUploadingFavicon(false)
      e.target.value = ''
    }
  }

  if (loading || !form) return <p className="text-gray-500">Cargando...</p>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración de la tienda</h1>

      {/* EmailConfigCard oculta hasta rol super admin, ver AdminStoreConfig.jsx */}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Logo y favicon</h2>
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">Logo</p>
            {form.logoUrl && <img src={form.logoUrl} alt="Logo" className="h-16 mb-2 object-contain" />}
            <label className="btn-secondary inline-block cursor-pointer text-sm">
              {uploadingLogo ? 'Subiendo...' : 'Cambiar logo'}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Favicon</p>
            {form.faviconUrl && <img src={form.faviconUrl} alt="Favicon" className="h-10 w-10 mb-2 object-contain" />}
            <label className="btn-secondary inline-block cursor-pointer text-sm">
              {uploadingFavicon ? 'Subiendo...' : 'Cambiar favicon'}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFaviconUpload} disabled={uploadingFavicon} />
            </label>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre comercial"><input required className="input" value={form.storeName} onChange={(e) => update('storeName', e.target.value)} /></Field>
          <Field label="Razón social"><input className="input" value={form.legalName || ''} onChange={(e) => update('legalName', e.target.value)} /></Field>
          <Field label="RFC"><input className="input" value={form.rfc || ''} onChange={(e) => update('rfc', e.target.value)} /></Field>
          <Field label="Teléfono"><input className="input" value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} /></Field>
          <Field label="Correo de contacto"><input className="input" value={form.email || ''} onChange={(e) => update('email', e.target.value)} /></Field>
          <Field label="Dirección"><input className="input" value={form.address || ''} onChange={(e) => update('address', e.target.value)} /></Field>

          <Field label="Color primario">
            <div className="flex items-center gap-2">
              <input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="h-10 w-14 rounded border border-gray-300" />
              <input className="input" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} />
            </div>
          </Field>
          <Field label="Color secundario">
            <div className="flex items-center gap-2">
              <input type="color" value={form.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} className="h-10 w-14 rounded border border-gray-300" />
              <input className="input" value={form.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} />
            </div>
          </Field>

          <Field label="Mensaje de bienvenida" className="sm:col-span-2">
            <textarea className="input" rows={2} value={form.welcomeMessage || ''} onChange={(e) => update('welcomeMessage', e.target.value)} />
          </Field>
          <Field label="Mensaje del ticket" className="sm:col-span-2">
            <textarea className="input" rows={2} value={form.ticketMessage || ''} onChange={(e) => update('ticketMessage', e.target.value)} />
          </Field>
          <Field label="Información de envíos" className="sm:col-span-2">
            <textarea className="input" rows={2} value={form.shippingInfo || ''} onChange={(e) => update('shippingInfo', e.target.value)} />
          </Field>
          <Field label="Texto del footer" className="sm:col-span-2">
            <input className="input" value={form.footerText || ''} onChange={(e) => update('footerText', e.target.value)} />
          </Field>

          <Field label="Facebook"><input className="input" value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} /></Field>
          <Field label="Instagram"><input className="input" value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} /></Field>
          <Field label="Twitter / X"><input className="input" value={social.twitter} onChange={(e) => setSocial({ ...social, twitter: e.target.value })} /></Field>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Guardando...' : 'Guardar cambios'}</button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="block text-gray-700 mb-1 font-medium">{label}</span>
      {children}
    </label>
  )
}

const EMPTY_EMAIL_FORM = { enabled: false, smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpUsername: '', smtpPassword: '', fromAddress: '' }

/**
 * Configuración SMTP para el envío del ticket de compra. Vive en su propia tabla
 * (email_config), separada de store_config, y la contraseña nunca vuelve del Backend:
 * dejar el campo en blanco al guardar conserva la que ya estaba guardada.
 */
function EmailConfigCard() {
  const { notify } = useNotify()
  const [form, setForm] = useState(EMPTY_EMAIL_FORM)
  const [passwordConfigured, setPasswordConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    adminGetEmailConfig().then((r) => {
      const data = r.data.data
      setForm({ ...data, smtpPassword: '' })
      setPasswordConfigured(data.passwordConfigured)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await adminUpdateEmailConfig(form)
      notify('Configuración de correo actualizada', 'success')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card p-6 mb-6"><p className="text-gray-500 text-sm">Cargando configuración de correo...</p></div>

  return (
    <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Correo (envío del ticket de compra)</h2>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.enabled} onChange={(e) => update('enabled', e.target.checked)} />
          Habilitado
        </label>
      </div>
      <p className="text-xs text-gray-500">
        Al aprobarse un pago se envía el ticket al correo del cliente (el de su cuenta, o el capturado como invitado).
        Con Gmail necesitas una contraseña de aplicación: <span className="font-mono">myaccount.google.com/apppasswords</span>.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Host SMTP">
          <input required className="input" value={form.smtpHost} onChange={(e) => update('smtpHost', e.target.value)} />
        </Field>
        <Field label="Puerto">
          <input required type="number" className="input" value={form.smtpPort} onChange={(e) => update('smtpPort', Number(e.target.value))} />
        </Field>
        <Field label="Usuario / correo">
          <input className="input" value={form.smtpUsername || ''} onChange={(e) => update('smtpUsername', e.target.value)} />
        </Field>
        <Field label={passwordConfigured ? 'Contraseña (ya configurada)' : 'Contraseña'}>
          <input
            type="password"
            className="input"
            placeholder={passwordConfigured ? 'Dejar en blanco para no cambiarla' : ''}
            value={form.smtpPassword}
            onChange={(e) => update('smtpPassword', e.target.value)}
          />
        </Field>
        <Field label="Correo remitente (opcional)" className="sm:col-span-2">
          <input className="input" value={form.fromAddress || ''} onChange={(e) => update('fromAddress', e.target.value)} placeholder="Si se deja vacío, se usa el usuario SMTP" />
        </Field>
      </div>
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Guardando...' : 'Guardar correo'}</button>
      </div>
    </form>
  )
}
