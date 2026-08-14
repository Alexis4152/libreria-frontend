import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMyOrderDetail } from '../api/orders'
import { formatCurrency, formatDate } from '../utils/format'

export default function MyOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrderDetail(id).then((r) => setOrder(r.data.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container-app py-16 text-center text-gray-500">Cargando...</div>
  if (!order) return <div className="container-app py-16 text-center text-gray-500">No encontramos este pedido.</div>

  return (
    <div className="container-app py-6 sm:py-8 max-w-3xl mx-auto">
      <Link to="/mis-pedidos" className="text-sm text-primary-700 hover:underline">← Mis pedidos</Link>
      <div className="card p-6 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Folio {order.folio}</h1>
            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-100 text-primary-800">{order.status}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Envío</h3>
            <p className="text-gray-600">{order.shippingAddressLine1}</p>
            <p className="text-gray-600">{order.shippingCity}, {order.shippingState} {order.shippingPostalCode}</p>
          </div>
          {order.payment && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Pago</h3>
              <p className="text-gray-600">{order.payment.cardBrand} •••• {order.payment.cardLast4}</p>
              <p className="text-gray-600">Estado: {order.payment.status}</p>
            </div>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 font-medium">Producto</th>
              <th className="py-2 font-medium text-center">Cant.</th>
              <th className="py-2 font-medium text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.bookId} className="border-b border-gray-50">
                <td className="py-2">{it.title}</td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-right font-medium">{formatCurrency(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <div className="w-48 text-sm">
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-100 pt-2">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
