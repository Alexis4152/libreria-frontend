import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'ecommerce_cart'

/**
 * Carrito 100% client-side (localStorage), válido tanto para invitados como para usuarios
 * autenticados — decisión de arquitectura documentada en la Fase 2: no se persiste en
 * Backend en esta primera versión. El Backend siempre vuelve a validar stock/precio en el
 * checkout (ver CheckoutService), así que este carrito es solo una conveniencia de UI.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(book, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.bookId === book.id)
      const unitPrice = book.promoPrice ?? book.price
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, book.stock)
        return prev.map((i) => (i.bookId === book.id ? { ...i, quantity: newQty, stock: book.stock } : i))
      }
      return [
        ...prev,
        {
          bookId: book.id,
          sku: book.sku,
          title: book.title,
          author: book.authorNames,
          unitPrice,
          coverImageUrl: book.coverImageUrl,
          stock: book.stock,
          quantity: Math.min(quantity, book.stock),
        },
      ]
    })
  }

  function updateQuantity(bookId, quantity) {
    setItems((prev) =>
      prev.map((i) => (i.bookId === bookId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i))
    )
  }

  function removeItem(bookId) {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId))
  }

  function clear() {
    setItems([])
  }

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [items])

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
