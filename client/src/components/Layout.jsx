import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <main className="flex-1 w-full mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
