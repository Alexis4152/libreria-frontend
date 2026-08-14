import api from './axios'

export const checkout = (data) => api.post('/checkout', data)

export const getMyOrders = (params) => api.get('/orders', { params })
export const getMyOrderDetail = (id) => api.get(`/orders/${id}`)

export const adminListOrders = (params) => api.get('/admin/orders', { params })
export const adminGetOrder = (id) => api.get(`/admin/orders/${id}`)
export const adminUpdateOrderStatus = (id, status, note) =>
  api.patch(`/admin/orders/${id}/status`, { status, note })

export const getDashboard = () => api.get('/admin/dashboard')
