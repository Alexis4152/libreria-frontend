import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedBooks, searchBooks } from '../api/books'
import { getCategories } from '../api/catalog'
import { useStoreConfig } from '../context/StoreConfigContext'
import BookCard from '../components/BookCard'

export default function Home() {
  const { config } = useStoreConfig()
  const [featured, setFeatured] = useState([])
  const [newest, setNewest] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getFeaturedBooks(),
      searchBooks({ sort: 'newest', size: 8 }),
      getCategories(),
    ])
      .then(([f, n, c]) => {
        setFeatured(f.data.data)
        setNewest(n.data.data.content)
        setCategories(c.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <div className="container-app py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              {config?.welcomeMessage || 'Encuentra tu próxima lectura'}
            </h1>
            <p className="mt-4 text-primary-100 text-base sm:text-lg">
              Miles de títulos, envíos a todo el país y las mejores promociones en un solo lugar.
            </p>
            <Link to="/catalogo" className="inline-block mt-6 bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors">
              Explorar catálogo
            </Link>
          </div>
          <div className="hidden lg:block text-[10rem] text-center select-none opacity-90">📚</div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-app py-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Explora por categoría</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/catalogo?categoryId=${c.id}`}
                className="card p-4 text-center hover:shadow-md hover:border-primary-200 transition-shadow"
              >
                <span className="text-sm font-medium text-gray-700">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-app py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Destacados</h2>
          <Link to="/catalogo?featuredOnly=true" className="text-sm font-medium text-primary-700 hover:underline">Ver todos</Link>
        </div>
        {loading ? (
          <SkeletonGrid />
        ) : featured.length === 0 ? (
          <EmptyState text="Aún no hay libros destacados." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {featured.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </section>

      <section className="container-app py-6 pb-14">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Novedades</h2>
          <Link to="/catalogo?sort=newest" className="text-sm font-medium text-primary-700 hover:underline">Ver todos</Link>
        </div>
        {loading ? (
          <SkeletonGrid />
        ) : newest.length === 0 ? (
          <EmptyState text="Aún no hay libros nuevos." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {newest.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        )}
      </section>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <div className="aspect-[3/4] bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ text }) {
  return <p className="text-gray-500 text-sm py-8 text-center">{text}</p>
}
