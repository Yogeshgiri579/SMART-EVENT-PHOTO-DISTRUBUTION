import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import EventsList from './pages/EventsList'
import EventDetail from './pages/EventDetail'
import EventNew from './pages/EventNew'
import EventRegister from './pages/EventRegister'
import EventUpload from './pages/EventUpload'
import EventPhotos from './pages/EventPhotos'
import MyPhotos from './pages/MyPhotos'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<ProtectedRoute><EventsList /></ProtectedRoute>} />
        <Route path="events/new" element={<ProtectedRoute><EventNew /></ProtectedRoute>} />
        <Route path="events/:eventId" element={<EventDetail />} />
        <Route path="events/:eventId/register" element={<ProtectedRoute><EventRegister /></ProtectedRoute>} />
        <Route path="events/:eventId/upload" element={<ProtectedRoute><EventUpload /></ProtectedRoute>} />
        <Route path="events/:eventId/photos" element={<ProtectedRoute><EventPhotos /></ProtectedRoute>} />
        <Route path="my-photos" element={<ProtectedRoute><MyPhotos /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
