import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
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
        
        {user && (
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden sm:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="block w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm leading-5 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        )}

        <nav className="flex items-center gap-2 sm:gap-6">
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
              <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
              <div className="items-center gap-3 hidden sm:flex">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-600 outline-none text-sm font-medium">
                  {user.name || user.email.split('@')[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
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
      </div>
    </header>
  )
}
