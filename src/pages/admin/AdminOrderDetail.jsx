import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminGetOrder, adminUpdateOrderStatus } from '../../api/orders'
import { formatCurrency, formatDate } from '../../utils/format'
import { useNotify } from '../../context/NotifyContext'

const STATUSES = ['PENDIENTE', 'PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

export default function AdminOrderDetail() {
  const { id } = useParams()
  const { notify } = useNotify()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)

  function load() {
    setLoading(true)
    adminGetOrder(id).then((r) => {
      setOrder(r.data.data)
      setNewStatus(r.data.data.status)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  async function handleUpdateStatus(e) {
    e.preventDefault()
    if (newStatus === order.status) return
    setUpdating(true)
    try {
      await adminUpdateOrderStatus(id, newStatus, note)
      notify('Estado del pedido actualizado', 'success')
      setNote('')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo cambiar el estado', 'error')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>
  if (!order) return <p className="text-gray-500">Pedido no encontrado.</p>

  return (
    <div className="max-w-3xl">
      <Link to="/admin/pedidos" className="text-sm text-primary-700 hover:underline">← Pedidos</Link>

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
            <h3 className="font-semibold text-gray-900 mb-1">Cliente</h3>
            <p className="text-gray-600">{order.buyerFirstName} {order.buyerLastName}</p>
            <p className="text-gray-600">{order.buyerEmail}</p>
            <p className="text-gray-600">{order.buyerPhone}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Envío</h3>
            <p className="text-gray-600">{order.shippingAddressLine1}</p>
            <p className="text-gray-600">{order.shippingCity}, {order.shippingState} {order.shippingPostalCode}</p>
          </div>
        </div>

        <table className="w-full text-sm mb-6">
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
                <td className="py-2">{it.title} <span className="text-gray-400">({it.sku})</span></td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-right font-medium">{formatCurrency(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-48 text-sm">
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-100 pt-2">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateStatus} className="border-t border-gray-100 pt-5">
          <h3 className="font-semibold text-gray-900 mb-3">Cambiar estado</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="input sm:w-48" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              className="input flex-1"
              placeholder="Nota (opcional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button type="submit" disabled={updating || newStatus === order.status} className="btn-primary shrink-0">
              {updating ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
