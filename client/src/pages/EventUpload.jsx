import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadPhotos } from '../api/photos'
import { useAuth } from '../context/AuthContext'

export default function EventUpload() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const { user } = useAuth()

  const mutation = useMutation({
    mutationFn: (filesToUpload) => uploadPhotos(eventId, filesToUpload, user._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['eventJobs', eventId] })
      queryClient.invalidateQueries({ queryKey: ['eventPhotos', eventId] })
      navigate(`/events/${eventId}`)
    },
    onError: (err) => {
      console.error('Upload error details:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed. Please try again.'
      setError(errorMessage)
      console.error('Full error:', err.response?.data)
    },
  })

  const createPreview = (file) => {
    return URL.createObjectURL(file)
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith('image/')
    )
    if (selected.length === 0) return

    const newFiles = [...files, ...selected]
    const newPreviews = [...previews, ...selected.map(createPreview)]
    
    setFiles(newFiles)
    setPreviews(newPreviews)
    setError('')
  }

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index])
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith('image/')
    )
    if (dropped.length === 0) return

    const newFiles = [...files, ...dropped]
    const newPreviews = [...previews, ...dropped.map(createPreview)]
    
    setFiles(newFiles)
    setPreviews(newPreviews)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length === 0) {
      setError('Please select at least one photo.')
      return
    }
    setError('')
    mutation.mutate(files)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(`/events/${eventId}`)}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to event
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Event Photos</h1>
          <p className="text-slate-600 mb-8">
            Upload photos from your event. Our AI will automatically match faces and deliver them to attendees.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragOver
                ? 'border-primary-500 bg-primary-50 scale-[1.02]'
                : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-slate-700 mb-2">
                  Drop photos here or click to browse
                </p>
                <p className="text-slate-500 text-sm">
                  Supports JPEG, PNG, WebP. Upload up to 500 photos at once.
                </p>
              </div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  {files.length} photo{files.length !== 1 ? 's' : ''} selected
                </h2>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  + Add more
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-primary-400 transition-all bg-slate-100"
                  >
                    <img
                      src={previews[index]}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all"
                        aria-label="Remove"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs truncate">{file.name}</p>
                      <p className="text-white/80 text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <form onSubmit={handleSubmit} className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={mutation.isPending || files.length === 0}
                className="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading {files.length} photo{files.length !== 1 ? 's' : ''}...
                  </span>
                ) : (
                  `Upload ${files.length} photo${files.length !== 1 ? 's' : ''}`
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/events/${eventId}`)}
                className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
