import api from './client'

export const getMyPhotos = (params) =>
  api.get('/deliveries/my-photos', { params }).then((r) => r.data)

export const getMyPhotosByEvent = (eventId, params) =>
  api.get(`/deliveries/my-photos/event/${eventId}`, { params }).then((r) => r.data)
