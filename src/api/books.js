import api from './axios'

export const searchBooks = (params) => api.get('/public/books', { params })
export const getFeaturedBooks = () => api.get('/public/books/featured')
export const getBookDetail = (id) => api.get(`/public/books/${id}`)

export const adminListBooks = (params) => api.get('/admin/books', { params })
export const adminGetBook = (id) => api.get(`/admin/books/${id}`)
export const adminCreateBook = (data) => api.post('/admin/books', data)
export const adminUpdateBook = (id, data) => api.put(`/admin/books/${id}`, data)
export const adminDeactivateBook = (id) => api.delete(`/admin/books/${id}`)
export const adminAdjustStock = (id, stock) => api.patch(`/admin/books/${id}/stock`, { stock })
export const adminAddBookImage = (id, file, primary) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('primary', primary)
  return api.post(`/admin/books/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const adminDeleteBookImage = (id, imageId) => api.delete(`/admin/books/${id}/images/${imageId}`)
export const adminSetPrimaryBookImage = (id, imageId) => api.patch(`/admin/books/${id}/images/${imageId}/primary`)
