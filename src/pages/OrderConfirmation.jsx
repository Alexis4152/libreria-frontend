import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStoreConfig } from '../context/StoreConfigContext'
import { formatCurrency, formatDate } from '../utils/format'

export default function OrderConfirmation() {
  const { folio } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const { config } = useStoreConfig()
  const order = location.state?.order

  return (
    <div className="container-app py-8 sm:py-12">
      <div className="max-w-2xl mx-auto text-center mb-8 print:hidden">
        <p className="text-5xl mb-3">🎉</p>
        <h1 className="text-2xl font-bold text-gray-900">¡Gracias por tu compra!</h1>
        <p className="text-gray-600 mt-1">Folio de pedido: <span className="font-semibold">{folio}</span></p>
      </div>

      {order ? (
        <div id="ticket" className="max-w-2xl mx-auto card p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              {config?.logoUrl && <img src={config.logoUrl} alt="" className="h-10 w-auto" />}
              <div>
                <p className="font-bold text-gray-900">{config?.storeName || 'Librería Online'}</p>
                {config?.address && <p className="text-xs text-gray-500">{config.address}</p>}
                {config?.phone && <p className="text-xs text-gray-500">{config.phone}</p>}
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>Folio: <span className="font-semibold text-gray-800">{order.folio}</span></p>
              <p>{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Cliente</h3>
              <p className="text-gray-600">{order.buyerFirstName} {order.buyerLastName}</p>
              <p className="text-gray-600">{order.buyerEmail}</p>
              <p className="text-gray-600">{order.buyerPhone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Envío</h3>
              <p className="text-gray-600">{order.shippingAddressLine1}</p>
              {order.shippingAddressLine2 && <p className="text-gray-600">{order.shippingAddressLine2}</p>}
              <p className="text-gray-600">{order.shippingCity}, {order.shippingState} {order.shippingPostalCode}</p>
              <p className="text-gray-600">{order.shippingCountry}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 font-medium">Producto</th>
                <th className="py-2 font-medium text-center">Cant.</th>
                <th className="py-2 font-medium text-right">Precio</th>
                <th className="py-2 font-medium text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.bookId} className="border-b border-gray-50">
                  <td className="py-2 text-gray-800">{it.title}</td>
                  <td className="py-2 text-center text-gray-600">{it.quantity}</td>
                  <td className="py-2 text-right text-gray-600">{formatCurrency(it.unitPrice)}</td>
                  <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(it.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-48 text-sm space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-100 pt-1">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {order.payment && (
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-xs text-gray-500">
              <p>Pago con tarjeta {order.payment.cardBrand} terminación {order.payment.cardLast4}</p>
              <p>Autorización: {order.payment.authorizationCode || '—'} · Folio de pago: {order.payment.transactionId}</p>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            {config?.ticketMessage || 'Gracias por tu compra'}
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No tenemos el detalle de este pedido a la mano. {user ? 'Consulta tus pedidos para ver el detalle completo.' : ''}
        </p>
      )}

      <div className="max-w-2xl mx-auto flex flex-wrap gap-3 justify-center mt-8 print:hidden">
        <button onClick={() => window.print()} className="btn-secondary">Imprimir comprobante</button>
        {user ? (
          <Link to="/mis-pedidos" className="btn-primary">Ver mis pedidos</Link>
        ) : (
          <Link to="/catalogo" className="btn-primary">Seguir comprando</Link>
        )}
      </div>
    </div>
  )
}
