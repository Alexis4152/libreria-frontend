import api from './axios'

export const getStoreConfig = () => api.get('/public/store-config')
export const adminGetStoreConfig = () => api.get('/admin/store-config')
export const adminUpdateStoreConfig = (data) => api.put('/admin/store-config', data)
export const adminUploadLogo = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/admin/store-config/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const adminUploadFavicon = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/admin/store-config/favicon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const adminGetEmailConfig = () => api.get('/admin/email-config')
export const adminUpdateEmailConfig = (data) => api.put('/admin/email-config', data)
