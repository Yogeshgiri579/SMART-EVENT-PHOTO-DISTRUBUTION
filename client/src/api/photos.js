import api from './client'

export const uploadPhoto = (eventId, file) => {
  const formData = new FormData()
  formData.append('photo', file)
  return api.post(`/events/${eventId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)
}

export const uploadPhotos = (eventId, files, organizerId) => {
  const formData = new FormData()
  for (let i = 0; i < files.length; i++) {
    formData.append('photos', files[i])
  }
  formData.append('organizerId', organizerId)
  // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
  return api.post(`/events/${eventId}/photos/batch`, formData, {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`Upload progress: ${percentCompleted}%`)
      }
    },
  }).then((r) => r.data).catch((err) => {
    console.error('Upload error:', err)
    console.error('Response:', err.response?.data)
    console.error('Status:', err.response?.status)
    throw err
  })
}

export const listEventPhotos = (eventId, params) =>
  api.get(`/events/${eventId}/photos`, { params }).then((r) => r.data)

export const getUploadUrl = (eventId, filename) =>
  api.post(`/events/${eventId}/photos/upload-url`, { filename }).then((r) => r.data)
export const confirmUpload = (eventId, key) =>
  api.post(`/events/${eventId}/photos/confirm`, { key }).then((r) => r.data)
export const getEventJobStats = (eventId) =>
  api.get(`/events/${eventId}/jobs`).then((r) => r.data)