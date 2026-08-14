import { useStoreConfig } from '../context/StoreConfigContext'

export default function Footer() {
  const { config } = useStoreConfig()
  const year = new Date().getFullYear()

  return (
    <footer className="print:hidden bg-gray-900 text-gray-300 mt-12">
      <div className="container-app py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="text-white font-semibold mb-3">{config?.storeName || 'Librería Online'}</h3>
          <p className="text-gray-400">{config?.welcomeMessage}</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contacto</h4>
          <ul className="space-y-1 text-gray-400">
            {config?.address && <li>{config.address}</li>}
            {config?.phone && <li>{config.phone}</li>}
            {config?.email && <li>{config.email}</li>}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Envíos</h4>
          <p className="text-gray-400">{config?.shippingInfo}</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Ayuda</h4>
          <ul className="space-y-1 text-gray-400">
            <li><a href="/catalogo" className="hover:text-white">Catálogo</a></li>
            <li><a href="/mis-pedidos" className="hover:text-white">Mis pedidos</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        {config?.footerText || `© ${year} ${config?.storeName || 'Librería Online'}`}
      </div>
    </footer>
  )
}
