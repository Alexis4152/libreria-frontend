import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, me as apiMe } from '../api/auth'

const AuthContext = createContext(null)

/**
 * Fuente central de verdad de la sesión: mantiene `user` en memoria sincronizado con
 * localStorage (`ecommerce_token`/`ecommerce_user`) y expone login/register/logout e `isAdmin`.
 * Al montar, restaura la sesión guardada de inmediato (evita parpadeos de UI) y en paralelo
 * llama a `/auth/me` para refrescar el perfil por si cambió desde el último login.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ecommerce_user')
    const token = localStorage.getItem('ecommerce_token')
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        apiMe()
          .then((r) => {
            const fresh = r.data.data
            localStorage.setItem('ecommerce_user', JSON.stringify(fresh))
            setUser(fresh)
          })
          .catch(() => {})
      } catch {
        logout()
      }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const res = await apiLogin({ email, password })
    const { token, user: userData } = res.data.data
    localStorage.setItem('ecommerce_token', token)
    localStorage.setItem('ecommerce_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  async function register(payload) {
    const res = await apiRegister(payload)
    const { token, user: userData } = res.data.data
    localStorage.setItem('ecommerce_token', token)
    localStorage.setItem('ecommerce_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  function logout() {
    localStorage.removeItem('ecommerce_token')
    localStorage.removeItem('ecommerce_user')
    setUser(null)
  }

  function updateUserInMemory(partial) {
    setUser((prev) => {
      const merged = { ...prev, ...partial }
      localStorage.setItem('ecommerce_user', JSON.stringify(merged))
      return merged
    })
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, loading, updateUserInMemory }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
