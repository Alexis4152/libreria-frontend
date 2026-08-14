import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/format'
import { useCart } from '../context/CartContext'
import { useNotify } from '../context/NotifyContext'

export default function BookCard({ book }) {
  const { addItem } = useCart()
  const { notify } = useNotify()
  const hasPromo = book.promoPrice != null && book.promoPrice < book.price
  const outOfStock = book.stock <= 0

  function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addItem(book, 1)
    notify(`"${book.title}" se agregó al carrito`, 'success')
  }

  return (
    <Link
      to={`/libro/${book.id}`}
      className="card flex flex-col overflow-hidden hover:shadow-md transition-shadow group"
    >
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
        <img
          src={book.coverImageUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        {book.newRelease && (
          <span className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            NUEVO
          </span>
        )}
        {hasPromo && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            OFERTA
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">{book.title}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{book.authorNames || book.publisherName || ''}</p>

        <div className="mt-2 flex items-baseline gap-2">
          {hasPromo ? (
            <>
              <span className="text-base font-bold text-red-600">{formatCurrency(book.promoPrice)}</span>
              <span className="text-xs text-gray-400 line-through">{formatCurrency(book.price)}</span>
            </>
          ) : (
            <span className="text-base font-bold text-gray-900">{formatCurrency(book.price)}</span>
          )}
        </div>

        <p className={`text-xs mt-1 ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
          {outOfStock ? 'Agotado' : 'Disponible'}
        </p>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn-primary mt-3 w-full text-sm py-2 disabled:cursor-not-allowed"
        >
          {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </Link>
  )
}
