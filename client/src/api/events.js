import api from './client'

export const listEvents = (params) => api.get('/events', { params }).then((r) => r.data)
export const getEvent = (id) => api.get(`/events/${id}`).then((r) => r.data)
export const createEvent = (data) => api.post('/events', data).then((r) => r.data)
export const updateEvent = (id, data) => api.patch(`/events/${id}`, data).then((r) => r.data)
export const deleteEvent = (id) => api.delete(`/events/${id}`).then((r) => r.data)

export const registerAttendee = (eventId, formData) =>
  api.post(`/events/${eventId}/attendees`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)

export const getMyAttendeeStatus = (eventId) =>
  api.get(`/events/${eventId}/attendees/me`).then((r) => r.data)

export const updateAttendeeSelfie = (eventId, formData) =>
  api.put(`/events/${eventId}/attendees/me`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)

export const getMyPhotos = (eventId) =>
  api.get(`/events/${eventId}/my-photos`).then((r) => r.data)

export const unregisterAttendee = (eventId) =>
  api.delete(`/events/${eventId}/attendees/me`).then((r) => r.data)
