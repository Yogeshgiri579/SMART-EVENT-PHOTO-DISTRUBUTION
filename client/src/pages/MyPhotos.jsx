
import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getMyPhotos, listEvents } from '../api/events'

export default function MyPhotos() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialEventId = searchParams.get('event') || ''
  
  const [selectedEventId, setSelectedEventId] = useState(initialEventId)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const { data: eventsList, isLoading: loadingEvents } = useQuery({
    queryKey: ['events'],
    queryFn: () => listEvents(),
  })

  // We find info about the currently selected event
  const currentEvent = eventsList?.events?.find(e => e.id === selectedEventId) || null

  const mutation = useMutation({
    mutationFn: () => getMyPhotos(selectedEventId),
    onSuccess: (data) => {
      setResults(data.matches || [])
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to find photos. Did you register for this event?')
      setResults(null)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedEventId) {
      setError('Please select an event.')
      return
    }
    setError('')
    mutation.mutate()
  }

  // Helper to force download of an image
  const handleDownload = async (url, score) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `momentdrop_match_${(score * 100).toFixed(0)}percent.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Failed to download image:', err)
      // Fallback
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Your Memories</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-slate-500 sm:mt-4">
            Select an event to let our AI find every photo you were captured in.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden max-w-2xl mx-auto">
          <div className="p-8 sm:p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 border-none">Choose an Event</label>
                <select 
                  value={selectedEventId}
                  onChange={(e) => { setSelectedEventId(e.target.value); setResults(null); }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all appearance-none"
                  required
                >
                  <option value="" disabled>-- Select an active event --</option>
                  {eventsList?.events?.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending || !selectedEventId || loadingEvents}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold text-lg hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-primary-500/30"
              >
                {mutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Scanning Event Data...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find My Photos
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {results !== null && (
          <div className="pt-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {results.length > 0 ? `Found ${results.length} memories` : "No matching photos found yet."}
              </h2>
            </div>
            
            {results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((match, i) => (
                  <div
                    key={i}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden w-full">
                      <img
                        src={match.imageUrl}
                        alt="Match"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-primary-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ring-1 ring-slate-900/5">
                        {(match.score * 100).toFixed(0)}% Match
                      </div>

                      <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => handleDownload(match.imageUrl, match.score)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download HD
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {results.length === 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No photos found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  We couldn't find your face in the uploaded event photos yet. Keep an eye out as the organizer uploads more!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
