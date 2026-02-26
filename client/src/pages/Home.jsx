import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import image from "../assets/girl.jpg"

export default function Home() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="w-full relative overflow-hidden bg-white min-h-[calc(100vh-4rem)]">
      {/* Top Hero Background Wrapper */}
      <div className="absolute top-0 left-0 right-0 h-[1000px] md:h-[1100px] bg-[#EDE8FF] md:m-4 md:rounded-[3rem] z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-20 lg:pb-32">
        <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-medium text-sm mb-8 ring-1 ring-primary-500/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
            AI-Powered Photo Delivery
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
            The easiest way to share <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-indigo-500 to-purple-600">
              event memories
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed mb-10">
            Stop searching through hundreds of photos. MomentDrop uses advanced facial recognition to instantly find and securely deliver the photos you appear in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            {user ? (
              <>
                <Link
                  to="/events"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold text-lg hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/my-photos"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-lg hover:bg-slate-50 hover:shadow-lg hover:border-slate-300 transform hover:-translate-y-0.5 transition-all"
                >
                  Find My Photos
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-semibold text-lg hover:to-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-lg hover:bg-slate-50 hover:shadow-lg hover:border-slate-300 transform hover:-translate-y-0.5 transition-all"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Interactive Image Graphic Section */}
        <div className={`mt-20 relative w-full max-w-5xl mx-auto h-[500px] md:h-[650px] transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          {/* Center Person Image */}
          <div className="absolute inset-0 flex items-end md:items-center justify-center pointer-events-none">
            <div className="relative w-72 md:w-80 h-96 md:h-[450px] border-b-0 overflow-visible pointer-events-auto z-20">
              <img src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=600&h=800&q=80" alt="Face Recognition Selfie" className="w-full h-full object-cover rounded-t-full rounded-b-3xl md:rounded-3xl shadow-2xl border-4 border-white object-top" />
              {/* Facial Recognition Overlay */}
              <div className="absolute inset-0 rounded-t-full rounded-b-3xl md:rounded-3xl overflow-hidden pointer-events-none flex items-center justify-center">
                 <div className="w-40 h-40 border-2 border-cyan-400 bg-cyan-400/10 relative">
                   {/* Scanning line */}
                   <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-300 shadow-[0_0_12px_3px_rgba(34,211,238,0.8)] animate-[scan_2s_linear_infinite]"></div>
                   {/* Corners */}
                   <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-300"></div>
                   <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-300"></div>
                   <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-300"></div>
                   <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-300"></div>
                 </div>
              </div>
            </div>
          </div>

          {/* Floating UI Elements */}
          
          {/* Top Left - Attendee */}
          <div className="absolute top-0 left-0 md:left-12 bg-white p-5 rounded-2xl shadow-xl w-48 md:w-60 z-30 animate-[float_6s_ease-in-out_infinite]">
            <h4 className="font-bold text-slate-800 mb-3 text-sm md:text-base">Attendee</h4>
            <div className="flex -space-x-3">
              <img src="https://i.pravatar.cc/150?img=1" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm" alt="face" />
              <img src="https://i.pravatar.cc/150?img=5" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-green-400 shadow-sm" alt="face" />
              <img src="https://i.pravatar.cc/150?img=8" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm" alt="face" />
              <img src="https://i.pravatar.cc/150?img=9" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm" alt="face" />
            </div>
          </div>

          {/* Mid Left - AI Button */}
          <div className="absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 bg-[#7C3AED] text-white px-4 md:px-6 py-3 rounded-xl shadow-lg shadow-purple-500/30 font-semibold flex items-center gap-2 z-30 animate-[float_8s_ease-in-out_infinite_reverse]">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8V5a2 2 0 012-2h3m10 0h3a2 2 0 012 2v3M4 16v3a2 2 0 002 2h3m10 0h3a2 2 0 002-2v-3" /></svg>
            <span className="text-sm md:text-base whitespace-nowrap">AI Face Recognition</span>
          </div>

          {/* Bottom Left - Photo Stats */}
          <div className="absolute bottom-6 md:bottom-20 left-2 md:left-24 bg-white p-4 md:p-5 rounded-2xl shadow-xl w-[280px] z-30 animate-[float_7s_ease-in-out_infinite]">
            <div className="bg-[#7C3AED] text-white text-xs font-bold px-3 py-1.5 rounded-lg absolute -top-3 right-4 shadow-md flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Stats
            </div>
            <h4 className="font-bold text-slate-500 text-xs md:text-sm mb-4">Event Delivery</h4>
            <div className="flex justify-between items-end gap-2">
              <div>
                <p className="text-[10px] md:text-xs text-slate-400 mb-1">Photos</p>
                <p className="font-bold text-slate-800 text-base md:text-lg">2.4k</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-slate-400 mb-1">Faces</p>
                <p className="font-bold text-slate-800 text-base md:text-lg">5.1k</p>
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-slate-400 mb-1">Matched</p>
                <p className="font-bold text-[#7C3AED] text-base md:text-xl">96%</p>
              </div>
            </div>
            {/* Swirly line connection representation */}
            <div className="absolute top-1/2 -right-8 w-12 h-12 border-b-2 border-r-2 border-slate-700/60 rounded-br-full transform -rotate-45 hidden md:block"></div>
          </div>

          {/* Top Right - UGC */}
          <div className="absolute top-6 md:top-12 right-0 md:right-16 bg-white p-3 md:p-4 rounded-3xl shadow-xl w-40 md:w-52 z-30 animate-[float_7s_ease-in-out_infinite_reverse]">
            <div className="flex items-center gap-2 mb-3">
              <img src="https://i.pravatar.cc/150?img=9" className="w-6 h-6 rounded-full" />
              <span className="text-xs font-bold text-slate-700">Susan Roy</span>
            </div>
            <div className="w-full h-24 md:h-32 bg-slate-50 rounded-2xl mb-3 relative flex items-center justify-center border border-slate-100">
                <div className="bg-[#7C3AED] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md absolute right-0 translate-x-4 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                  UGC
                </div>
            </div>
            <div className="flex items-center gap-2 text-slate-300 px-1">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <svg className="w-4 h-4 ml-auto transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </div>
          </div>

          {/* Mid Right - Attending */}
          <div className="absolute top-1/2 right-2 md:-right-8 -translate-y-1/2 bg-white p-4 rounded-3xl shadow-xl w-44 md:w-48 z-10 animate-[float_6s_ease-in-out_infinite]">
            <div className="flex items-center gap-2 mb-3">
              <img src="https://i.pravatar.cc/150?img=9" className="w-8 h-8 rounded-full" />
              <span className="text-xs font-bold text-slate-700">Susan Roy</span>
            </div>
            <div className="bg-[#F8F5FF] rounded-2xl p-4 md:p-6 mb-3 min-h-[5rem] flex items-center">
               <p className="text-[#7C3AED] font-bold leading-tight">I am<br/>Attending</p>
            </div>
            <div className="flex items-center gap-2 text-slate-300 px-1">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <svg className="w-4 h-4 ml-auto transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </div>
          </div>

          {/* Bottom Right - Impressions */}
          <div className="absolute bottom-10 md:bottom-28 right-8 md:right-16 bg-white p-5 rounded-2xl shadow-xl w-52 md:w-64 z-30 animate-[float_8s_ease-in-out_infinite_reverse]">
             <div className="mb-2">
                <span className="text-[#7C3AED] font-bold text-xl md:text-2xl leading-none">130k</span>
                <p className="text-xs text-slate-400 mt-1">Impressions</p>
             </div>
             {/* Chart line SVG */}
             <div className="h-10 w-full relative -mx-2">
                <svg className="w-[120%] h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 20">
                  <path d="M-10 15 Q 15 5 25 10 T 50 15 T 75 5 Q 90 15 110 5" fill="none" stroke="url(#chartGradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#c4b5fd" />
                      <stop offset="20%" stopColor="#7C3AED" />
                      <stop offset="60%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Dot */}
                <div className="absolute top-2.5 left-[20%] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#7C3AED] rounded-full border-2 border-white shadow-sm"></div>
             </div>
          </div>
        </div>

        {/* Feature Sections - Split Layout */}
        <div className={`mt-32 space-y-28 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>

          {/* Feature 1 — Bulk Uploads */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            {/* Left: Image */}
            <div className="w-full md:w-1/2 relative">
              <div className="w-full aspect-[4/3] rounded-3xl bg-[#EDE8FF] flex items-center justify-center overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=700&q=80"
                  alt="Bulk photo uploads"
                  className="w-full h-full object-cover opacity-90 rounded-3xl"
                />
                {/* Floating upload pill */}
                <div className="absolute top-5 left-5 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold text-sm text-slate-700">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Uploading 248 photos…
                </div>
                {/* Upload progress bar */}
                <div className="absolute bottom-5 left-5 right-5 bg-white rounded-2xl p-3 shadow-lg">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Upload Progress</span><span className="text-[#7C3AED] font-semibold">78%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-gradient-to-r from-[#7C3AED] to-indigo-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right: Text */}
            <div className="w-full md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-3 block">Feature #1</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
                Upload <span className="text-[#7C3AED]">hundreds of photos</span> in one go.
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Organizers can bulk-upload high-resolution event photos securely into the cloud in seconds. No size limits. No complexity.
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors">
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>

          {/* Feature 2 — AI Face Matching (reversed) */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
            {/* Right: Image */}
            <div className="w-full md:w-1/2 relative">
              <div className="w-full aspect-[4/3] rounded-3xl bg-[#EDE8FF] flex items-center justify-center overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80"
                  alt="Girl Taking Selfie"
                  className="w-full h-full object-cover rounded-3xl object-[50%_10%]"
                />
                {/* Face scan overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-12">
                  <div className="w-48 h-80 mt-12 border-2 border-cyan-400 bg-cyan-300/10 relative rounded-sm">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] animate-[scan_2s_linear_infinite]"></div>
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
                  </div>
                </div>
                {/* Match badge */}
                <div className="absolute bottom-5 right-5 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold text-sm text-slate-700">
                  <span className="text-green-500">✓</span> Face Matched!
                </div>
              </div>
            </div>
            {/* Left: Text */}
            <div className="w-full md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-3 block">Feature #2</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
                AI finds you in <span className="text-[#7C3AED]">every photo</span>, instantly.
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Our background neural engine silently scans every uploaded event photo, comparing faces to your registered selfie — no searching needed.
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors">
                Try It Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>

          {/* Feature 3 — Private & Secure */}
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            {/* Left: Image */}
            <div className="w-full md:w-1/2 relative">
              <div className="w-full aspect-[4/3] rounded-3xl bg-[#EDE8FF] flex items-center justify-center overflow-hidden relative p-10">
                {/* Abstract lock graphic */}
                <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-purple-200">
                    <svg className="w-12 h-12 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-8 h-2 rounded-full bg-[#7C3AED]/20 overflow-hidden">
                        <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${60 + i * 8}%` }}></div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#7C3AED] font-bold tracking-widest uppercase mt-1">AES-256 Encrypted</p>
                </div>
                {/* Delete badge */}
                <div className="absolute top-5 right-5 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold text-sm text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete Anytime
                </div>
              </div>
            </div>
            {/* Right: Text */}
            <div className="w-full md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED] mb-3 block">Feature #3</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
                Your data stays <span className="text-[#7C3AED]">private & secure</span>.
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Your selfies and biometric face maps are heavily encrypted. You can unregister from any event at any time to permanently delete your data.
              </p>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>

        </div>
        
        {/* How it Works Section */}
        <div className={`mt-32 max-w-5xl mx-auto transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How MomentDrop Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Three simple steps to seamless photo delivery.</p>
          </div>
          
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary-100 text-primary-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Create an Event</h4>
                <p className="text-slate-500">Organizers set up a space and invite attendees to join via a simple link or QR code.</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Upload a Selfie</h4>
                <p className="text-slate-500">Attendees register by taking a quick selfie. Your face map is extracted securely.</p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-purple-100 text-purple-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Magic Delivery</h4>
                <p className="text-slate-500">As the organizer uploads event photos, the AI instantly finds matches and drops them directly into your personal dashboard.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className={`mt-32 max-w-4xl mx-auto rounded-3xl bg-slate-900 overflow-hidden shadow-2xl transition-all duration-1000 delay-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="px-8 py-16 md:px-16 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to never miss a memory?</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of organizers and attendees currently powering their events with MomentDrop.
            </p>
            {!user && (
              <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl text-slate-900 bg-white hover:bg-slate-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Create Free Account
              </Link>
            )}
            {user && (
              <Link to="/events/new" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl text-slate-900 bg-white hover:bg-slate-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Create an Event Now
              </Link>
            )}
          </div>
        </div>

      </div>
      
      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <span className="font-bold text-slate-700">MomentDrop</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} MomentDrop. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes scan {
          0% { top: 0; opacity: 1; }
          50% { top: 100%; opacity: 1; }
          50.1% { top: 100%; opacity: 0; }
          99.9% { top: 0; opacity: 0; }
          100% { top: 0; opacity: 1; }
        }
      `}</style>
    </div>
  )
}
