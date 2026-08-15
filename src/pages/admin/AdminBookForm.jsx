import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminGetBook, adminCreateBook, adminUpdateBook,
  adminAddBookImage, adminDeleteBookImage, adminReorderBookImages,
} from '../../api/books'
import { getCategories, getAuthors, getPublishers } from '../../api/catalog'
import { useNotify } from '../../context/NotifyContext'

const EMPTY = {
  sku: '', isbn: '', title: '', subtitle: '', descriptionShort: '', descriptionLong: '',
  categoryId: '', publisherId: '', authorIds: [], price: '', promoPrice: '', stock: 0,
  publicationYear: '', pageCount: '', language: '', coverType: '',
  widthCm: '', heightCm: '', depthCm: '', weightGrams: '', featured: false, newRelease: false,
}

export default function AdminBookForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notify } = useNotify()

  const [form, setForm] = useState(EMPTY)
  const [images, setImages] = useState([])
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    Promise.all([getCategories(), getAuthors(), getPublishers()]).then(([c, a, p]) => {
      setCategories(c.data.data)
      setAuthors(a.data.data)
      setPublishers(p.data.data)
    })
  }, [])

  useEffect(() => {
    if (!isEdit) return
    adminGetBook(id).then((r) => {
      const b = r.data.data
      setForm({
        sku: b.sku, isbn: b.isbn || '', title: b.title, subtitle: b.subtitle || '',
        descriptionShort: b.descriptionShort || '', descriptionLong: b.descriptionLong || '',
        categoryId: b.category?.id || '', publisherId: b.publisher?.id || '',
        authorIds: b.authors?.map((a) => a.id) || [],
        price: b.price, promoPrice: b.promoPrice ?? '', stock: b.stock,
        publicationYear: b.publicationYear ?? '', pageCount: b.pageCount ?? '', language: b.language || '',
        coverType: b.coverType || '', widthCm: b.widthCm ?? '', heightCm: b.heightCm ?? '', depthCm: b.depthCm ?? '',
        weightGrams: b.weightGrams ?? '', featured: b.featured, newRelease: b.newRelease,
      })
      setImages(b.images || [])
    }).finally(() => setLoading(false))
  }, [id, isEdit])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleAuthor(authorId) {
    setForm((f) => ({
      ...f,
      authorIds: f.authorIds.includes(authorId) ? f.authorIds.filter((x) => x !== authorId) : [...f.authorIds, authorId],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      publisherId: form.publisherId ? Number(form.publisherId) : null,
      price: Number(form.price),
      promoPrice: form.promoPrice === '' ? null : Number(form.promoPrice),
      stock: Number(form.stock),
      publicationYear: form.publicationYear === '' ? null : Number(form.publicationYear),
      pageCount: form.pageCount === '' ? null : Number(form.pageCount),
      coverType: form.coverType || null,
      widthCm: form.widthCm === '' ? null : Number(form.widthCm),
      heightCm: form.heightCm === '' ? null : Number(form.heightCm),
      depthCm: form.depthCm === '' ? null : Number(form.depthCm),
      weightGrams: form.weightGrams === '' ? null : Number(form.weightGrams),
    }
    try {
      if (isEdit) {
        await adminUpdateBook(id, payload)
        notify('Libro actualizado', 'success')
      } else {
        const res = await adminCreateBook(payload)
        notify('Libro creado', 'success')
        navigate(`/admin/libros/${res.data.data.id}`, { replace: true })
        return
      }
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo guardar el libro', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await adminAddBookImage(id, file, images.length === 0)
      setImages((prev) => [...prev, res.data.data])
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo subir la imagen', 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleImageDelete(imageId) {
    try {
      await adminDeleteBookImage(id, imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo eliminar la imagen', 'error')
    }
  }

  async function handleMove(index, direction) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= images.length) return
    const reordered = [...images]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    try {
      const res = await adminReorderBookImages(id, reordered.map((img) => img.id))
      setImages(res.data.data)
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo reordenar las imagenes', 'error')
    }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Editar libro' : 'Nuevo libro'}</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU"><input required className="input" value={form.sku} onChange={(e) => update('sku', e.target.value)} /></Field>
          <Field label="ISBN"><input className="input" value={form.isbn} onChange={(e) => update('isbn', e.target.value)} /></Field>
          <Field label="Título" className="sm:col-span-2"><input required className="input" value={form.title} onChange={(e) => update('title', e.target.value)} /></Field>
          <Field label="Subtítulo" className="sm:col-span-2"><input className="input" value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} /></Field>

          <Field label="Categoría">
            <select required className="input" value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
              <option value="">Selecciona...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Editorial">
            <select className="input" value={form.publisherId} onChange={(e) => update('publisherId', e.target.value)}>
              <option value="">Sin editorial</option>
              {publishers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <span className="block text-sm text-gray-700 mb-1 font-medium">Autores</span>
            <div className="flex flex-wrap gap-2">
              {authors.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => toggleAuthor(a.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    form.authorIds.includes(a.id) ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          <Field label="Precio"><input required type="number" step="0.01" min="0" className="input" value={form.price} onChange={(e) => update('price', e.target.value)} /></Field>
          <Field label="Precio promocional (opcional)"><input type="number" step="0.01" min="0" className="input" value={form.promoPrice} onChange={(e) => update('promoPrice', e.target.value)} /></Field>
          <Field label="Stock"><input required type="number" min="0" className="input" value={form.stock} onChange={(e) => update('stock', e.target.value)} /></Field>
          <Field label="Idioma"><input className="input" value={form.language} onChange={(e) => update('language', e.target.value)} /></Field>

          <Field label="Año de publicación"><input type="number" className="input" value={form.publicationYear} onChange={(e) => update('publicationYear', e.target.value)} /></Field>
          <Field label="Páginas"><input type="number" min="0" className="input" value={form.pageCount} onChange={(e) => update('pageCount', e.target.value)} /></Field>
          <Field label="Tipo de portada">
            <select className="input" value={form.coverType} onChange={(e) => update('coverType', e.target.value)}>
              <option value="">Sin especificar</option>
              <option value="PASTA_BLANDA">Pasta blanda</option>
              <option value="PASTA_DURA">Pasta dura</option>
              <option value="DIGITAL">Digital</option>
            </select>
          </Field>
          <Field label="Peso (gramos)"><input type="number" min="0" className="input" value={form.weightGrams} onChange={(e) => update('weightGrams', e.target.value)} /></Field>

          <Field label="Ancho (cm)"><input type="number" step="0.1" className="input" value={form.widthCm} onChange={(e) => update('widthCm', e.target.value)} /></Field>
          <Field label="Alto (cm)"><input type="number" step="0.1" className="input" value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} /></Field>
          <Field label="Profundidad (cm)"><input type="number" step="0.1" className="input" value={form.depthCm} onChange={(e) => update('depthCm', e.target.value)} /></Field>

          <Field label="Descripción corta" className="sm:col-span-2">
            <textarea className="input" rows={2} value={form.descriptionShort} onChange={(e) => update('descriptionShort', e.target.value)} />
          </Field>
          <Field label="Descripción larga" className="sm:col-span-2">
            <textarea className="input" rows={4} value={form.descriptionLong} onChange={(e) => update('descriptionLong', e.target.value)} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} />
            Producto destacado
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.newRelease} onChange={(e) => update('newRelease', e.target.checked)} />
            Producto nuevo
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/libros')}>Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Guardando...' : 'Guardar libro'}</button>
        </div>
      </form>

      {isEdit && (
        <div className="card p-6 mt-6">
          <h2 className="font-semibold text-gray-900 mb-4">Imágenes</h2>
          <p className="text-xs text-gray-500 mb-3">
            El orden define cómo se ven al consultar el libro. La imagen #1 es siempre la principal.
          </p>
          <div className="flex flex-wrap gap-3 mb-4">
            {images.map((img, index) => (
              <div key={img.id} className="relative w-24 h-32 rounded-lg overflow-hidden border border-gray-200">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <span
                  className={`absolute top-1 left-1 text-white text-[9px] px-1.5 rounded ${
                    index === 0 ? 'bg-primary-600' : 'bg-black/60'
                  }`}
                >
                  {index === 0 ? 'Principal' : `#${index + 1}`}
                </span>
                <button
                  onClick={() => handleImageDelete(img.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs leading-none"
                >
                  ✕
                </button>
                <div className="absolute bottom-0 inset-x-0 flex bg-black/60">
                  <button
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="flex-1 text-white text-[11px] py-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Mover antes"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => handleMove(index, 1)}
                    disabled={index === images.length - 1}
                    className="flex-1 text-white text-[11px] py-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Mover despues"
                  >
                    ▶
                  </button>
                </div>
              </div>
            ))}
          </div>
          <label className="btn-secondary inline-block cursor-pointer text-sm">
            {uploading ? 'Subiendo...' : '+ Agregar imagen'}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
      )}
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
