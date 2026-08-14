import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNotify } from '../context/NotifyContext'
import { getMyAddresses } from '../api/users'
import { checkout } from '../api/orders'
import { formatCurrency } from '../utils/format'

const STEPS = ['Comprador', 'Envío', 'Pago']

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const { notify } = useNotify()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')

  const [buyer, setBuyer] = useState({
    buyerFirstName: user?.firstName || '',
    buyerLastName: user?.lastName || '',
    buyerEmail: user?.email || '',
    buyerPhone: user?.phone || '',
  })
  const [shipping, setShipping] = useState({
    addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'México',
  })
  const [card, setCard] = useState({ holderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' })

  useEffect(() => {
    if (user) {
      getMyAddresses().then((r) => setSavedAddresses(r.data.data)).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    if (items.length === 0 && !submitting) navigate('/carrito')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function nextStep(e) {
    e.preventDefault()
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handlePay(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
        ...buyer,
        shippingAddress: selectedAddressId
          ? { addressId: Number(selectedAddressId) }
          : shipping,
        card,
      }
      const res = await checkout(payload)
      const result = res.data.data
      if (result.approved) {
        clear()
        navigate(`/pedido-confirmado/${result.order.folio}`, { state: { order: result.order } })
      } else {
        notify(result.message || 'El pago fue rechazado, intenta con otra tarjeta', 'error')
      }
    } catch (err) {
      notify(err.response?.data?.message || 'No se pudo procesar tu pedido', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="container-app py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="flex items-center gap-2 mb-8 text-sm">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full flex items-center justify-center font-semibold text-xs ${
              i <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i + 1}
            </span>
            <span className={i <= step ? 'text-gray-900 font-medium' : 'text-gray-400'}>{label}</span>
            {i < STEPS.length - 1 && <span className="w-6 sm:w-10 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="card p-5 sm:p-6">
          {step === 0 && (
            <form onSubmit={nextStep} className="space-y-4">
              <h2 className="font-semibold text-gray-900">Datos del comprador</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre">
                  <input required className="input" value={buyer.buyerFirstName}
                    onChange={(e) => setBuyer({ ...buyer, buyerFirstName: e.target.value })} />
                </Field>
                <Field label="Apellido">
                  <input required className="input" value={buyer.buyerLastName}
                    onChange={(e) => setBuyer({ ...buyer, buyerLastName: e.target.value })} />
                </Field>
                <Field label="Correo electrónico">
                  <input required type="email" className="input" value={buyer.buyerEmail}
                    onChange={(e) => setBuyer({ ...buyer, buyerEmail: e.target.value })} />
                  <span className="block text-xs text-gray-500 mt-1">
                    {user
                      ? 'Enviaremos tu comprobante de compra a este correo.'
                      : 'A este correo te enviaremos tu ticket de compra.'}
                  </span>
                </Field>
                <Field label="Teléfono">
                  <input required className="input" value={buyer.buyerPhone}
                    onChange={(e) => setBuyer({ ...buyer, buyerPhone: e.target.value })} />
                </Field>
              </div>
              {!user && (
                <p className="text-xs text-gray-500">
                  ¿Ya tienes cuenta? <Link to="/login" className="text-primary-700 hover:underline">Inicia sesión</Link> para agilizar tu compra.
                </p>
              )}
              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary">Continuar</button>
              </div>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-4">
              <h2 className="font-semibold text-gray-900">Dirección de envío</h2>

              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  {savedAddresses.map((a) => (
                    <label key={a.id} className="flex items-start gap-2 border border-gray-200 rounded-lg p-3 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={String(selectedAddressId) === String(a.id)}
                        onChange={() => setSelectedAddressId(a.id)}
                      />
                      <span>
                        <span className="font-medium">{a.recipientName}</span> — {a.addressLine1}, {a.city}, {a.state} {a.postalCode}
                      </span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="savedAddress" checked={selectedAddressId === ''} onChange={() => setSelectedAddressId('')} />
                    Usar otra dirección
                  </label>
                </div>
              )}

              {selectedAddressId === '' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Dirección" className="sm:col-span-2">
                    <input required className="input" value={shipping.addressLine1}
                      onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })} />
                  </Field>
                  <Field label="Referencias (opcional)" className="sm:col-span-2">
                    <input className="input" value={shipping.addressLine2}
                      onChange={(e) => setShipping({ ...shipping, addressLine2: e.target.value })} />
                  </Field>
                  <Field label="Ciudad">
                    <input required className="input" value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                  </Field>
                  <Field label="Estado">
                    <input required className="input" value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
                  </Field>
                  <Field label="Código postal">
                    <input required className="input" value={shipping.postalCode}
                      onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} />
                  </Field>
                  <Field label="País">
                    <input required className="input" value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })} />
                  </Field>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button type="button" onClick={prevStep} className="btn-secondary">Atrás</button>
                <button type="submit" className="btn-primary">Continuar</button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePay} className="space-y-4">
              <h2 className="font-semibold text-gray-900">Pago con tarjeta (simulado)</h2>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Este es un pago DUMMY con fines de demostración. No se procesa ningún cobro real.
                Tip: una tarjeta que termine en dígito par se aprueba; impar se rechaza.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre del titular" className="sm:col-span-2">
                  <input required className="input" value={card.holderName}
                    onChange={(e) => setCard({ ...card, holderName: e.target.value })} />
                </Field>
                <Field label="Número de tarjeta" className="sm:col-span-2">
                  <input required inputMode="numeric" maxLength={19} className="input" placeholder="4111 1111 1111 1112"
                    value={card.cardNumber}
                    onChange={(e) => setCard({ ...card, cardNumber: e.target.value.replace(/\D/g, '') })} />
                </Field>
                <Field label="Mes (MM)">
                  <input required maxLength={2} className="input" placeholder="12" value={card.expiryMonth}
                    onChange={(e) => setCard({ ...card, expiryMonth: e.target.value.replace(/\D/g, '') })} />
                </Field>
                <Field label="Año (AAAA)">
                  <input required maxLength={4} className="input" placeholder="2030" value={card.expiryYear}
                    onChange={(e) => setCard({ ...card, expiryYear: e.target.value.replace(/\D/g, '') })} />
                </Field>
                <Field label="CVV">
                  <input required maxLength={4} inputMode="numeric" className="input" placeholder="123" value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} />
                </Field>
              </div>
              <div className="flex justify-between pt-2">
                <button type="button" onClick={prevStep} className="btn-secondary" disabled={submitting}>Atrás</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Procesando...' : `Pagar ${formatCurrency(subtotal)}`}
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="card p-5 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
          <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((i) => (
              <li key={i.bookId} className="flex justify-between text-sm gap-2">
                <span className="text-gray-600 line-clamp-1">{i.quantity} × {i.title}</span>
                <span className="font-medium shrink-0">{formatCurrency(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-100 pt-3 mt-3">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </aside>
      </div>
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
