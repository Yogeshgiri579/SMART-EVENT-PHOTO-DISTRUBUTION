import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { listEvents } from '../api/events'

export default function EventsList() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const q = searchParams.get('search')
    if (q !== null) setSearch(q)
  }, [searchParams])

  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => listEvents(),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-48 border border-slate-100 shadow-sm animate-pulse p-6 flex flex-col justify-between">
                <div>
                  <div className="w-2/3 h-6 bg-slate-200 rounded-md mb-3"></div>
                  <div className="w-full h-4 bg-slate-100 rounded-md mb-2"></div>
                  <div className="w-5/6 h-4 bg-slate-100 rounded-md"></div>
                </div>
                <div className="w-1/3 h-4 bg-slate-200 rounded-md mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 p-8 rounded-2xl border border-red-100 max-w-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h3 className="text-xl font-bold text-red-800 mb-2">Failed to Load Dashboard</h3>
          <p className="text-red-600">Please check your connection and try refreshing the page.</p>
        </div>
      </div>
    )
  }

  const events = data?.events ?? []

  const filteredEvents = events.filter(e => {
    if (!search) return true;
    const s = search.toLowerCase();
    
    // Attempt to extract event ID if a full link was pasted
    const possibleIdMatch = search.match(/events\/([a-zA-Z0-9_-]+)/i);
    const searchId = possibleIdMatch ? possibleIdMatch[1].toLowerCase() : s;
    
    if (e.name.toLowerCase().includes(s)) return true;
    if (e._id.toLowerCase() === searchId || (e.id && e.id.toLowerCase() === searchId)) return true;
    if (e._id.toLowerCase().includes(s)) return true;
    
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Events Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage all your active events and albums.</p>
          </div>
          <Link
            to="/events/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-lg shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create New Event
          </Link>
        </div>

        <div className="mb-8">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by event name or invite link..."
              className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl leading-5 border-transparent placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors shadow-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm mt-8">
            <div className="w-24 h-24 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{search ? 'No Match Found' : 'Your Timeline is Empty'}</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">
              {search ? 'Try adjusting your search query.' : 'Get started by creating your first event. You\'ll be able to invite attendees and instantly deliver photos.'}
            </p>
            {!search && (
              <Link
                to="/events/new"
                className="inline-flex px-8 py-3 rounded-xl bg-slate-900 text-white font-semibold text-lg hover:bg-slate-800 shadow-md hover:shadow-xl transition-all"
              >
                Create My First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event, i) => (
              <div 
                key={event._id} 
                className="group opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Link
                  to={`/events/${event._id}`}
                  className="block h-full bg-white rounded-3xl border border-slate-100 p-6 hover:border-primary-300 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-50 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {event.name}
                    </h2>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors shrink-0">
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {event.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center pt-4 border-t border-slate-100">
                    <div className="flex -space-x-2 mr-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700">
                        {event.attendeeCount > 0 ? '🙋' : '👻'}
                      </div>
                    </div>
                    <p className="text-slate-600 font-medium text-sm">
                      {event.attendeeCount ?? 0} {event.attendeeCount === 1 ? 'Attendee' : 'Attendees'}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
