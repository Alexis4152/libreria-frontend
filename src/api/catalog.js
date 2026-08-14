import api from './axios'

export const getCategories = () => api.get('/public/categories')
export const getAuthors = () => api.get('/public/authors')
export const getPublishers = () => api.get('/public/publishers')

export const adminListCategories = (params) => api.get('/admin/categories', { params })
export const adminCreateCategory = (data) => api.post('/admin/categories', data)
export const adminUpdateCategory = (id, data) => api.put(`/admin/categories/${id}`, data)
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`)

export const adminListAuthors = (params) => api.get('/admin/authors', { params })
export const adminCreateAuthor = (data) => api.post('/admin/authors', data)
export const adminUpdateAuthor = (id, data) => api.put(`/admin/authors/${id}`, data)
export const adminDeleteAuthor = (id) => api.delete(`/admin/authors/${id}`)

export const adminListPublishers = (params) => api.get('/admin/publishers', { params })
export const adminCreatePublisher = (data) => api.post('/admin/publishers', data)
export const adminUpdatePublisher = (id, data) => api.put(`/admin/publishers/${id}`, data)
export const adminDeletePublisher = (id) => api.delete(`/admin/publishers/${id}`)
