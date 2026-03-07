import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, name)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-primary-50 px-4 relative">
      <Link 
        to="/" 
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-medium transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-slate-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      <div className="w-full max-w-md mt-12 sm:mt-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">MomentDrop</h1>
          <p className="text-slate-500 mt-1">Event photo distribution</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Min 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
          <p className="mt-6 text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" state={{ from: location.state?.from }} className="text-primary-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
