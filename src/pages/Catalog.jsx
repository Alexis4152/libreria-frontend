import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchBooks } from '../api/books'
import { getCategories, getAuthors, getPublishers } from '../api/catalog'
import BookCard from '../components/BookCard'
import Pagination from '../components/Pagination'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'title', label: 'Título A-Z' },
]

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [result, setResult] = useState({ content: [], page: 0, totalPages: 0, totalElements: 0 })
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = params.get('q') || ''
  const categoryId = params.get('categoryId') || ''
  const authorId = params.get('authorId') || ''
  const publisherId = params.get('publisherId') || ''
  const minPrice = params.get('minPrice') || ''
  const maxPrice = params.get('maxPrice') || ''
  const inStockOnly = params.get('inStockOnly') === 'true'
  const sort = params.get('sort') || 'relevance'
  const page = Number(params.get('page') || 0)

  useEffect(() => {
    Promise.all([getCategories(), getAuthors(), getPublishers()]).then(([c, a, p]) => {
      setCategories(c.data.data)
      setAuthors(a.data.data)
      setPublishers(p.data.data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    searchBooks({
      q: q || undefined,
      categoryId: categoryId || undefined,
      authorId: authorId || undefined,
      publisherId: publisherId || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      inStockOnly: inStockOnly || undefined,
      sort,
      page,
      size: 12,
    })
      .then((r) => setResult(r.data.data))
      .finally(() => setLoading(false))
  }, [q, categoryId, authorId, publisherId, minPrice, maxPrice, inStockOnly, sort, page])

  function updateParam(key, value) {
    const next = new URLSearchParams(params)
    if (value === '' || value === false || value == null) next.delete(key)
    else next.set(key, value)
    next.delete('page')
    setParams(next)
  }

  function goToPage(newPage) {
    const next = new URLSearchParams(params)
    next.set('page', newPage)
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function clearFilters() {
    setParams({})
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {q ? `Resultados para "${q}"` : 'Catálogo de libros'}
          </h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{result.totalElements} resultados</p>}
        </div>
        <button className="lg:hidden btn-secondary text-sm" onClick={() => setFiltersOpen((v) => !v)}>
          {filtersOpen ? 'Ocultar filtros' : 'Filtros'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
          <FilterGroup title="Categoría">
            <RadioList
              options={[{ id: '', name: 'Todas' }, ...categories]}
              value={categoryId}
              onChange={(v) => updateParam('categoryId', v)}
            />
          </FilterGroup>
          <FilterGroup title="Autor">
            <RadioList
              options={[{ id: '', name: 'Todos' }, ...authors]}
              value={authorId}
              onChange={(v) => updateParam('authorId', v)}
            />
          </FilterGroup>
          <FilterGroup title="Editorial">
            <RadioList
              options={[{ id: '', name: 'Todas' }, ...publishers]}
              value={publisherId}
              onChange={(v) => updateParam('publisherId', v)}
            />
          </FilterGroup>
          <FilterGroup title="Precio">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Mín"
                defaultValue={minPrice}
                onBlur={(e) => updateParam('minPrice', e.target.value)}
                className="input text-sm"
              />
              <input
                type="number"
                placeholder="Máx"
                defaultValue={maxPrice}
                onBlur={(e) => updateParam('maxPrice', e.target.value)}
                className="input text-sm"
              />
            </div>
          </FilterGroup>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => updateParam('inStockOnly', e.target.checked)} />
            Solo disponibles
          </label>
          <button onClick={clearFilters} className="text-sm text-primary-700 hover:underline">Limpiar filtros</button>
        </aside>

        <div>
          <div className="flex items-center justify-end mb-4">
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input text-sm w-auto"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card aspect-[3/4] animate-pulse bg-gray-200" />
              ))}
            </div>
          ) : result.content.length === 0 ? (
            <p className="text-gray-500 text-center py-16">No encontramos libros con esos filtros.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {result.content.map((b) => <BookCard key={b.id} book={b} />)}
              </div>
              <Pagination page={result.page} totalPages={result.totalPages} onChange={goToPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
      {children}
    </div>
  )
}

function RadioList({ options, value, onChange }) {
  return (
    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-sm">
      {options.map((o) => (
        <label key={o.id} className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900">
          <input
            type="radio"
            checked={String(value) === String(o.id)}
            onChange={() => onChange(o.id)}
          />
          {o.name}
        </label>
      ))}
    </div>
  )
}
