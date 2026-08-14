# EcommerceLibreria — Frontend

SPA de la tienda online de libros, construida como evolución del stack técnico de **DemoPV-Frontend** (mismo React/Vite/Tailwind/Context API/patrón de theming dinámico), rediseñada para comercio electrónico.

## Tecnologías

- **React 18** + **Vite 5**, JavaScript (sin TypeScript, igual que el proyecto de referencia)
- **Tailwind CSS 3**, con color de marca dinámico (`primary-*` → variables CSS generadas desde el color configurado por el admin)
- **React Router 6**
- **axios**, con interceptores de JWT y manejo de 401
- Context API (sin Redux/Zustand): `AuthContext`, `CartContext`, `StoreConfigContext`, `NotifyContext`

## Prerrequisitos

- Node 18+ y npm
- El backend corriendo en `http://localhost:8081` (ver README del backend)

## Instalación y ejecución

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5174`. En desarrollo, `/api` y `/uploads` se redirigen (proxy de Vite) al backend en `localhost:8081` — no hace falta configurar nada más.

## Variables de entorno (producción)

Solo aplica cuando el frontend se despliega como sitio estático separado del backend:

```
VITE_API_URL=https://api.tu-dominio.com/api
```

## Build

```bash
npm run build
npm run preview   # sirve el build de producción localmente
```

## Arquitectura

```
src/
├── api/            un módulo por recurso del backend (books, catalog, users, orders, storeConfig, auth)
├── components/      Header, Footer, BookCard, Pagination, PrivateRoute
├── context/          AuthContext, CartContext, NotifyContext, StoreConfigContext
├── layouts/           StoreLayout (tienda), AdminLayout (panel admin, responsive con drawer en móvil)
├── pages/              páginas públicas y de cuenta
│   └── admin/            páginas del panel administrativo
└── utils/              theme.js (rampa de color dinámica), format.js (moneda/fechas)
```

## Decisiones de arquitectura

- **Carrito**: 100% client-side (`localStorage`, `CartContext`), tanto para invitados como para usuarios autenticados. El Backend siempre revalida stock y precio en el checkout, así que el carrito del cliente es solo una conveniencia de UI, nunca la fuente de verdad.
- **Branding dinámico**: `StoreConfigContext` carga `/api/public/store-config` al montar la app y aplica el color primario configurado por el admin (`utils/theme.js` genera una rampa de 10 tonos a partir de un solo color hex e inyecta variables CSS `--brand-*`, que Tailwind consume vía `tailwind.config.js`). Cambiar el color, logo o nombre de la tienda en el panel admin se refleja sin recompilar el frontend.
- **Confirmación de pedido**: el ticket de compra (`/pedido-confirmado/:folio`) recibe el pedido completo por `state` de React Router al navegar desde el checkout, en vez de un endpoint público "obtener pedido por folio" — evitar ese endpoint público previene que cualquiera con un folio pueda ver los datos de otra persona.

## Usuarios de prueba

| Rol | Email | Password |
|---|---|---|
| ADMIN | `admin@libreria-demo.com` | `Admin123!` |
| USER | `cliente@demo.com` | `Cliente123!` |

## Flujo de compra

1. Entra sin sesión, busca/filtra en `/catalogo`, abre el detalle de un libro (`/libro/:id`).
2. Agrega uno o más libros al carrito (`/carrito`), ajusta cantidades.
3. `/checkout`: datos del comprador → dirección de envío (nueva o guardada, si hay sesión) → tarjeta dummy (**una tarjeta que termine en dígito par se aprueba; impar se rechaza** — solo para pruebas, no se procesa ningún cobro real).
4. Al aprobarse el pago ve la confirmación con folio y comprobante imprimible en `/pedido-confirmado/:folio`.
5. Con sesión iniciada puede consultar `/mis-pedidos`, `/mi-cuenta` y `/mis-direcciones`.
6. Como ADMIN, `/admin` da acceso al dashboard, libros (con carga de imágenes), categorías, autores, editoriales, pedidos (cambio de estado), clientes y configuración de la tienda (branding, logo, colores, textos).

## Responsive

Todo el frontend (tienda y panel admin) está validado en desktop, tablet y móvil: el panel administrativo usa un drawer off-canvas en pantallas pequeñas en vez de requerir escritorio, a diferencia del proyecto de referencia.
