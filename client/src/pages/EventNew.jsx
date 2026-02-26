import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEvent } from '../api/events'
import { useAuth } from '../context/AuthContext'

export default function EventNew() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const mutation = useMutation({
    mutationFn: (data) => createEvent(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      navigate(`/events/${data.event.id}`)
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create event')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!user) {
      setError('You must be logged in to create an event.')
      return
    }
    mutation.mutate({ name, description, organizerId: String(user._id) })
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create event</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        {error && (
          <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
            Event name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            placeholder="e.g. Company Summit 2025"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            placeholder="Brief description for attendees"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Creating…' : 'Create event'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
