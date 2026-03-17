import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const debounceTimer = useRef(null)

  // Sync input when URL param changes externally (e.g. navigating away then back)
  useEffect(() => {
    if (location.pathname === '/events') {
      setSearchQuery(searchParams.get('search') || '')
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    debounceTimer.current = setTimeout(() => {
      if (location.pathname === '/events') {
        // Already on events page — update the URL param in-place
        const next = new URLSearchParams(searchParams)
        if (value.trim()) {
          next.set('search', value.trim())
        } else {
          next.delete('search')
        }
        setSearchParams(next, { replace: true })
      } else {
        // Navigate to events page with the search param
        if (value.trim()) {
          navigate(`/events?search=${encodeURIComponent(value.trim())}`)
        }
      }
    }, 400)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const isActive = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">

        {/* ── Left: Logo ─────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 hidden md:block">
            MomentDrop
          </span>
        </Link>

        {/* ── Center: Search bar (grows to fill remaining space) ─── */}
        {user && (
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 hidden sm:block max-w-md"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search events..."
                className="block w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </form>
        )}

        {/* ── Right: Nav links ───────────────────────────── */}
        <nav className="items-center gap-1 hidden md:flex shrink-0 ml-auto">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${isActive('/') ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                to="/events"
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${isActive('/events') ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                Dashboard
              </Link>
              <Link
                to="/my-photos"
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${isActive('/my-photos') ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                My Photos
              </Link>

              <div className="h-6 w-px bg-slate-200 mx-2" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-600 text-sm font-medium">
                  {user.name || user.email.split('@')[0]}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-primary-600 text-white px-5 py-2 rounded-full hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 transition-all transform hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* ── Mobile: hamburger ──────────────────────────── */}
        <div className="flex md:hidden items-center gap-4 ml-auto">
          <button
            type="button"
            className="text-slate-600 hover:text-slate-900 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {!isMobileMenuOpen ? (
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown ───────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl absolute top-16 inset-x-0 z-40">
          <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3 flex flex-col">

            {user && (
              <form onSubmit={handleSearchSubmit} className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  className="block w-full pl-9 pr-3 py-2 sm:text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-colors"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </form>
            )}

            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to="/events"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/events') ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-photos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/my-photos') ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  My Photos
                </Link>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center px-3 gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-medium text-slate-800">{user.name || 'User'}</div>
                      <div className="text-sm font-medium text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center px-3 py-3 rounded-md text-base font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center px-3 py-3 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
