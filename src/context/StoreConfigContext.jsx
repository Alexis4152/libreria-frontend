import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getStoreConfig } from '../api/storeConfig'
import { applyDefaultBrand, applyStoreBrand } from '../utils/theme'

const StoreConfigContext = createContext(null)

/**
 * Carga la configuración pública de la tienda (nombre, logo, colores, textos) una vez al
 * montar la app y aplica el color primario configurado como tema dinámico (ver utils/theme.js).
 * Toda la tienda consume esta configuración en vez de tener nombre/logo/colores hardcodeados.
 */
export function StoreConfigProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    return getStoreConfig()
      .then((r) => {
        const data = r.data.data
        setConfig(data)
        applyStoreBrand(data.primaryColor)
        if (data.faviconUrl) {
          const link = document.getElementById('favicon')
          if (link) link.href = data.faviconUrl
        }
        if (data.storeName) {
          document.title = data.storeName
        }
      })
      .catch(() => {
        applyDefaultBrand()
      })
  }, [])

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [reload])

  return (
    <StoreConfigContext.Provider value={{ config, loading, reload }}>
      {children}
    </StoreConfigContext.Provider>
  )
}

export const useStoreConfig = () => useContext(StoreConfigContext)
