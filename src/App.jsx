import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { NotifyProvider } from './context/NotifyContext'
import { StoreConfigProvider } from './context/StoreConfigContext'
import PrivateRoute from './components/PrivateRoute'

import StoreLayout from './layouts/StoreLayout'
import AdminLayout from './layouts/AdminLayout'

import Home from './pages/Home'
import Catalog from './pages/Catalog'
import BookDetail from './pages/BookDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Login from './pages/Login'
import Register from './pages/Register'
import MyOrders from './pages/MyOrders'
import MyOrderDetail from './pages/MyOrderDetail'
import MyProfile from './pages/MyProfile'
import MyAddresses from './pages/MyAddresses'
import NotFound from './pages/NotFound'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBooks from './pages/admin/AdminBooks'
import AdminBookForm from './pages/admin/AdminBookForm'
import AdminCategories from './pages/admin/AdminCategories'
import AdminAuthors from './pages/admin/AdminAuthors'
import AdminPublishers from './pages/admin/AdminPublishers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminStoreConfig from './pages/admin/AdminStoreConfig'

export default function App() {
  return (
    <BrowserRouter>
      <StoreConfigProvider>
        <AuthProvider>
          <NotifyProvider>
            <CartProvider>
              <Routes>
                <Route element={<StoreLayout />}>
                  <Route index element={<Home />} />
                  <Route path="catalogo" element={<Catalog />} />
                  <Route path="libro/:id" element={<BookDetail />} />
                  <Route path="carrito" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="pedido-confirmado/:folio" element={<OrderConfirmation />} />
                  <Route path="login" element={<Login />} />
                  <Route path="registro" element={<Register />} />

                  <Route path="mis-pedidos" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
                  <Route path="mis-pedidos/:id" element={<PrivateRoute><MyOrderDetail /></PrivateRoute>} />
                  <Route path="mi-cuenta" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
                  <Route path="mis-direcciones" element={<PrivateRoute><MyAddresses /></PrivateRoute>} />

                  <Route path="*" element={<NotFound />} />
                </Route>

                <Route
                  path="admin"
                  element={
                    <PrivateRoute adminOnly>
                      <AdminLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="libros" element={<AdminBooks />} />
                  <Route path="libros/nuevo" element={<AdminBookForm />} />
                  <Route path="libros/:id" element={<AdminBookForm />} />
                  <Route path="categorias" element={<AdminCategories />} />
                  <Route path="autores" element={<AdminAuthors />} />
                  <Route path="editoriales" element={<AdminPublishers />} />
                  <Route path="pedidos" element={<AdminOrders />} />
                  <Route path="pedidos/:id" element={<AdminOrderDetail />} />
                  <Route path="clientes" element={<AdminCustomers />} />
                  <Route path="configuracion" element={<AdminStoreConfig />} />
                </Route>
              </Routes>
            </CartProvider>
          </NotifyProvider>
        </AuthProvider>
      </StoreConfigProvider>
    </BrowserRouter>
  )
}
