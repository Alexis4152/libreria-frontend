import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/format'

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container-app py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Explora el catálogo y encuentra tu próxima lectura.</p>
        <Link to="/catalogo" className="btn-primary inline-block">Ir al catálogo</Link>
      </div>
    )
  }

  return (
    <div className="container-app py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Carrito de compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.bookId} className="card p-4 flex gap-4">
              <Link to={`/libro/${item.bookId}`} className="shrink-0 w-20 h-28 bg-gray-100 rounded-lg overflow-hidden">
                <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/libro/${item.bookId}`} className="font-semibold text-gray-900 hover:text-primary-700 line-clamp-2">
                  {item.title}
                </Link>
                {item.author && <p className="text-xs text-gray-500 mt-0.5">{item.author}</p>}
                <p className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(item.unitPrice)}</p>

                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      className="px-2.5 py-1 text-gray-600"
                      onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button
                      className="px-2.5 py-1 text-gray-600"
                      onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.bookId)} className="text-sm text-red-600 hover:underline">
                    Eliminar
                  </button>
                </div>
              </div>
              <p className="font-bold text-gray-900 shrink-0">{formatCurrency(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>

        <aside className="card p-5 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold text-gray-900 mb-4">Resumen</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-100 pt-3 mt-3">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-5">
            Proceder al pago
          </button>
          <Link to="/catalogo" className="block text-center text-sm text-primary-700 hover:underline mt-3">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  )
}
