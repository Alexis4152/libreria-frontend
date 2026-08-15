import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBookDetail } from '../api/books'
import { useCart } from '../context/CartContext'
import { useNotify } from '../context/NotifyContext'
import { formatCurrency } from '../utils/format'
import BookCard from '../components/BookCard'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { notify } = useNotify()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setLoading(true)
    setActiveImage(0)
    setQuantity(1)
    getBookDetail(id)
      .then((r) => setBook(r.data.data))
      .catch(() => setBook(null))
      .finally(() => setLoading(false))
    window.scrollTo({ top: 0 })
  }, [id])

  if (loading) {
    return <div className="container-app py-16 text-center text-gray-500">Cargando...</div>
  }
  if (!book) {
    return (
      <div className="container-app py-16 text-center">
        <p className="text-gray-500 mb-4">No encontramos este libro.</p>
        <Link to="/catalogo" className="btn-primary inline-block">Volver al catálogo</Link>
      </div>
    )
  }

  const hasPromo = book.promoPrice != null && book.promoPrice < book.price
  const outOfStock = book.stock <= 0
  const asBookCard = {
    id: book.id,
    title: book.title,
    price: book.price,
    promoPrice: book.promoPrice,
    stock: book.stock,
    sku: book.sku,
    authorNames: book.authors?.map((a) => a.name).join(', '),
  }

  function handleAddToCart() {
    addItem(asBookCard, quantity)
    notify(`"${book.title}" se agregó al carrito`, 'success')
  }

  function handleBuyNow() {
    addItem(asBookCard, quantity)
    navigate('/checkout')
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <nav className="text-xs text-gray-500 mb-4 flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-primary-700">Inicio</Link> /
        <Link to="/catalogo" className="hover:text-primary-700">Catálogo</Link> /
        {book.category && (
          <>
            <Link to={`/catalogo?categoryId=${book.category.id}`} className="hover:text-primary-700">{book.category.name}</Link> /
          </>
        )}
        <span className="text-gray-700 line-clamp-1">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden group">
            <img
              src={book.images?.[activeImage]?.url}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            {book.images?.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Imagen anterior"
                  onClick={() => setActiveImage((i) => (i - 1 + book.images.length) % book.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/80 text-gray-700 text-xl leading-none shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Imagen siguiente"
                  onClick={() => setActiveImage((i) => (i + 1) % book.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/80 text-gray-700 text-xl leading-none shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ›
                </button>
                <span className="absolute bottom-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full bg-black/50 text-white">
                  {activeImage + 1} / {book.images.length}
                </span>
              </>
            )}
          </div>
          {book.images?.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {book.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 ${i === activeImage ? 'border-primary-600' : 'border-transparent'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{book.title}</h1>
          {book.subtitle && <p className="text-gray-500 mt-1">{book.subtitle}</p>}
          {book.authors?.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              De <span className="font-medium">{book.authors.map((a) => a.name).join(', ')}</span>
            </p>
          )}
          {book.publisher && <p className="text-sm text-gray-500">Editorial: {book.publisher.name}</p>}
          <p className="text-xs text-gray-400 mt-1">SKU: {book.sku}{book.isbn ? ` · ISBN: ${book.isbn}` : ''}</p>

          <div className="mt-4 flex items-baseline gap-3">
            {hasPromo ? (
              <>
                <span className="text-3xl font-bold text-red-600">{formatCurrency(book.promoPrice)}</span>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(book.price)}</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900">{formatCurrency(book.price)}</span>
            )}
          </div>
          <p className={`text-sm mt-1 font-medium ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
            {outOfStock ? 'Sin existencias' : `${book.stock} disponibles`}
          </p>

          {book.descriptionShort && <p className="text-gray-700 mt-4">{book.descriptionShort}</p>}

          {!outOfStock && (
            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button className="px-3 py-2 text-gray-600" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span className="px-4 text-sm font-medium">{quantity}</span>
                <button className="px-3 py-2 text-gray-600" onClick={() => setQuantity((q) => Math.min(book.stock, q + 1))}>+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-secondary flex-1 sm:flex-none">Agregar al carrito</button>
              <button onClick={handleBuyNow} className="btn-primary flex-1 sm:flex-none">Comprar ahora</button>
            </div>
          )}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="font-semibold text-gray-900 mb-3">Ficha técnica</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              {book.pageCount && <Spec label="Páginas" value={book.pageCount} />}
              {book.language && <Spec label="Idioma" value={book.language} />}
              {book.publicationYear && <Spec label="Año de publicación" value={book.publicationYear} />}
              {book.coverType && <Spec label="Tipo de portada" value={book.coverType.replace('_', ' ')} />}
              {(book.widthCm || book.heightCm || book.depthCm) && (
                <Spec label="Dimensiones" value={`${book.widthCm ?? '-'} × ${book.heightCm ?? '-'} × ${book.depthCm ?? '-'} cm`} />
              )}
              {book.weightGrams && <Spec label="Peso" value={`${book.weightGrams} g`} />}
            </dl>
          </div>

          {book.descriptionLong && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h2 className="font-semibold text-gray-900 mb-2">Descripción</h2>
              <p className="text-gray-700 whitespace-pre-line">{book.descriptionLong}</p>
            </div>
          )}
        </div>
      </div>

      {book.relatedBooks?.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Libros relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {book.relatedBooks.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function Spec({ label, value }) {
  return (
    <>
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium">{value}</dd>
    </>
  )
}
