import { useParams, Link } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getEvent, getMyAttendeeStatus, unregisterAttendee } from '../api/events'
import { getEventJobStats } from '../api/photos'
import { useState } from 'react'

export default function EventDetail() {
  const { eventId } = useParams()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const { data: eventData, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId),
    enabled: !!eventId,
  })

  const queryClient = useQueryClient();

  const unregisterMutation = useMutation({
    mutationFn: () => unregisterAttendee(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendee', eventId] })
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    }
  })

  const handleUnregister = () => {
    if (window.confirm("Are you sure you want to unregister from this event? Your selfie data will be removed.")) {
      unregisterMutation.mutate()
    }
  }

  const event = eventData?.event;

  const organizerId = event?.organizerId ? String(event.organizerId) : ''
  const currentUserId = user?.id ?? user?._id ? String(user.id ?? user._id) : null
  const isOrganizer = !!organizerId && !!currentUserId && organizerId === currentUserId

  const { data: attendeeStatus, isLoading: attendeeLoading } = useQuery({
    queryKey: ['attendee', eventId],
    queryFn: () => getMyAttendeeStatus(eventId),
    enabled: !!eventId && !!user,
  })

  // Organizer details
  const eventUrl = `${window.location.origin}/events/${eventId}`;

  const { data: jobStats } = useQuery({
    queryKey: ['eventJobs', eventId],
    queryFn: () => getEventJobStats(eventId),
    enabled: !!eventId && isOrganizer,
    refetchInterval: 5000,
  })

  if (eventLoading || !event) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (eventError) {
    return (
      <div className="text-red-600 bg-red-50 px-4 py-3 rounded-lg">
        Event not found or you don't have access.
      </div>
    )
  }

  const isAttendee = attendeeStatus?.registered



  // If organizerId is missing, show warning
  const hasNoOrganizer = !organizerId

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-medium transition-colors mb-4 group">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Back to Dashboard
        </Link>

        {/* Hero Section */}
        <div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-100/50 to-indigo-100/50 rounded-bl-full -z-10 blur-xl"></div>

          <div className="p-8 sm:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold tracking-wide uppercase mb-4">Event</span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">{event.name}</h1>
              {event.description && (
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">{event.description}</p>
              )}
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-500 text-sm font-medium">Overview</span>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-sm font-bold text-indigo-700 shadow-sm z-20">🙋</div>
                  <div className="w-10 h-10 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-sm font-bold text-primary-700 shadow-sm z-10">📸</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 leading-none">{event.attendeeCount || 0}</div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Attendees</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isOrganizer && (
        <div className="bg-white border text-center border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 justify-between shadow-sm">
          <div className="text-left flex-1">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Invite Attendees</h3>
            <p className="text-slate-600 mb-4 max-w-sm">
              Have attendees scan this QR code or share the link with them directly so they can upload their selfies.
            </p>
            <div className="flex bg-slate-100 rounded-lg p-3 items-center border border-slate-200 shadow-inner">
              <input
                type="text"
                readOnly
                value={eventUrl}
                className="bg-transparent border-none text-slate-700 outline-none flex-1 truncate text-sm px-2 font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(eventUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="ml-3 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-semibold transition-colors w-20 text-center"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {navigator.share && (
              <button
                onClick={async () => {
                  try {
                    const svgNode = document.getElementById("event-qr-code");
                    if (svgNode) {
                      const svgData = new XMLSerializer().serializeToString(svgNode);
                      const canvas = document.createElement("canvas");
                      const ctx = canvas.getContext("2d");
                      const img = new Image();
                      
                      img.onload = () => {
                        // Add padding/background to the canvas so it looks nice
                        canvas.width = img.width + 40;
                        canvas.height = img.height + 40;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 20, 20);
                        
                        canvas.toBlob(async (blob) => {
                          const file = new File([blob], 'event-qr.png', { type: 'image/png' });
                          try {
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                files: [file],
                                title: event.name,
                                text: `Join ${event.name} and upload your selfies!`,
                                url: eventUrl
                              });
                            } else {
                              await navigator.share({
                                title: event.name,
                                text: `Join ${event.name} and upload your selfies!`,
                                url: eventUrl
                              });
                            }
                          } catch (e) {
                            console.log('Share error:', e);
                          }
                        });
                      };
                      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
                    } else {
                      await navigator.share({
                        title: event.name,
                        text: `Join ${event.name} and upload your selfies!`,
                        url: eventUrl
                      });
                    }
                  } catch (e) {
                    console.log('Share error:', e);
                  }
                }}
                className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Share Event Link
              </button>
            )}
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-md flex-shrink-0">
            <QRCode
              id="event-qr-code"
              value={eventUrl}
              size={140}
              bgColor={"#ffffff"}
              fgColor={"#0f172a"}
              level={"M"}
            />
          </div>
        </div>
      )}

      {/* Show loading state placeholder to prevent glitching Register button visibility */}
      {attendeeLoading && !isOrganizer && (
        <div className="relative overflow-hidden bg-slate-100 rounded-3xl p-8 sm:p-10 animate-pulse h-48 border border-slate-200"></div>
      )}

      {!attendeeLoading && !isAttendee && !isOrganizer && (
        <div className="relative overflow-hidden bg-primary-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-primary-500/20 transform transition-transform hover:-translate-y-1 duration-300">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Join this event</h3>
              <p className="text-primary-100 max-w-lg leading-relaxed">
                Register with a quick selfie and let our AI securely find and deliver your photos. Your biometric data is encrypted.
              </p>
            </div>
            <Link
              to={`/events/${eventId}/register`}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white text-primary-600 font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg hover:shadow-xl shrink-0"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Register with Selfie
            </Link>
          </div>
        </div>
      )}

      {!attendeeLoading && isAttendee && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-8 sm:p-10 shadow-sm transform transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">You're on the list!</h3>
                <p className="text-emerald-800 font-medium">Sit back and relax. We'll find your photos automatically.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
              <Link
                to={`/my-photos?event=${eventId}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl text-center"
              >
                View My Photos
              </Link>
              <button
                onClick={handleUnregister}
                disabled={unregisterMutation.isPending}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-red-600 border border-red-200 font-bold hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm text-center"
              >
                {unregisterMutation.isPending ? 'Removing...' : 'Unregister'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isOrganizer && (
        <>
          {jobStats && (jobStats.pending > 0 || jobStats.completed > 0) && (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-800 font-semibold text-lg mb-1">Photo Processing Status</p>
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                      Pending: {jobStats.pending ?? 0}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      Completed: {jobStats.completed ?? 0}
                    </span>
                    {jobStats.failed > 0 && (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        Failed: {jobStats.failed ?? 0}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 pb-12">
            <Link
              to={`/events/${eventId}/upload`}
              className="group relative bg-white border border-slate-100 rounded-3xl p-8 hover:border-primary-200 transition-all hover:shadow-2xl hover:shadow-primary-500/10 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-50 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                  <svg className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary-700 transition-colors">Upload Photos</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Bulk upload high-resolution event photos. Our invisible AI neural engine will automatically match faces and deliver them to attendees in seconds.
              </p>
            </Link>

            <Link
              to={`/events/${eventId}/photos`}
              className="group relative bg-white border border-slate-100 rounded-3xl p-8 hover:border-indigo-200 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <svg className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">View Photo Gallery</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Browse through all the beautiful photos you've uploaded to this event. You have full control over the album.
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
    </div>
  )
}
