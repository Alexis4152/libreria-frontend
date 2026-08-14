import api from './axios'

export const getMe = () => api.get('/users/me')
export const updateMe = (data) => api.put('/users/me', data)

export const getMyAddresses = () => api.get('/users/me/addresses')
export const createAddress = (data) => api.post('/users/me/addresses', data)
export const updateAddress = (id, data) => api.put(`/users/me/addresses/${id}`, data)
export const deleteAddress = (id) => api.delete(`/users/me/addresses/${id}`)

export const adminListCustomers = (params) => api.get('/admin/customers', { params })
export const adminDeactivateCustomer = (id) => api.patch(`/admin/customers/${id}/deactivate`)
