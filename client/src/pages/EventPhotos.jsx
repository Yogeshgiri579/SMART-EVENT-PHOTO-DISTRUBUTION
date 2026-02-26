import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listEventPhotos } from '../api/photos'

export default function EventPhotos() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['eventPhotos', eventId],
    queryFn: () => listEventPhotos(eventId),
    enabled: !!eventId,
  })

  const photos = data?.photos ?? []

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(`/events/${eventId}`)}
          className="text-primary-600 hover:underline text-sm"
        >
          ← Back to event
        </button>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Event photos</h1>
      {error && (
        <div className="text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">
          Failed to load photos.
        </div>
      )}
      {photos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          No photos uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((p) => (
            <div
              key={p._id}
              className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
            >
              <img
                src={p.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
