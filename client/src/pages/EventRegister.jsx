import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registerAttendee } from '../api/events'
import ImageEditor from '../components/ImageEditor'

export default function EventRegister() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [consent, setConsent] = useState(false)

  const mutation = useMutation({
    mutationFn: (formData) => registerAttendee(eventId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['attendee', eventId] })
      navigate(`/events/${eventId}`)
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Registration failed')
    },
  })

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0]
    setError('')
    if (!f) return
    
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file (JPEG or PNG).')
      return
    }

    try {
      const compressedBlob = await compressImage(f)
      const compressedFile = new File([compressedBlob], f.name, { type: 'image/jpeg' })
      setFile(compressedFile)
      
      if (preview) URL.revokeObjectURL(preview)
      const url = URL.createObjectURL(compressedBlob)
      setPreview(url)
    } catch (err) {
      setError('Failed to process image.')
    }
  }

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const scaleSize = MAX_WIDTH / img.width
        canvas.width = MAX_WIDTH
        canvas.height = img.height * scaleSize

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas to Blob failed'))
        }, 'image/jpeg', 0.8)
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleEdit = () => {
    if (preview) {
      setShowEditor(true)
    }
  }

  const handleEditorSave = (editedBlob) => {
    const editedFile = new File([editedBlob], file.name, { type: 'image/jpeg' })
    setFile(editedFile)
    if (preview) URL.revokeObjectURL(preview)
    const url = URL.createObjectURL(editedBlob)
    setPreview(url)
    setShowEditor(false)
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a selfie photo.')
      return
    }
    if (!consent) {
      setError('You must provide explicit consent for facial recognition.')
      return
    }
    setError('')
    const formData = new FormData()
    formData.append('selfie', file)
    formData.append('processingConsent', consent)
    mutation.mutate(formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Register for Event</h1>
          <p className="text-slate-600 mb-8">
            Upload a clear selfie. We'll use facial recognition to find and deliver event photos where you appear.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Your Selfie Photo
              </label>
              
              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-slate-700 mb-1">Click to upload selfie</p>
                    <p className="text-slate-500 text-sm">JPEG or PNG, max 20MB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <div className="w-48 h-48 rounded-xl overflow-hidden border-4 border-primary-200 shadow-lg">
                      <img
                        src={preview}
                        alt="Selfie preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
                    >
                      ✏️ Edit Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click()
                      }}
                      className="px-4 py-2 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                    >
                      📷 Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        if (preview) URL.revokeObjectURL(preview)
                        setPreview(null)
                      }}
                      className="px-4 py-2 rounded-lg border-2 border-red-300 text-red-700 font-medium hover:bg-red-50 transition"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-primary-800 text-sm font-medium mb-1">💡 Tips for best results:</p>
              <ul className="text-primary-700 text-sm space-y-1 list-disc list-inside">
                <li>Use a clear, well-lit selfie</li>
                <li>Face the camera directly</li>
                <li>Remove sunglasses or masks</li>
                <li>Ensure your face is clearly visible</li>
              </ul>
            </div>

            <div className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="consent" className="text-sm text-slate-700 leading-relaxed cursor-pointer">
                I explicitly consent to the processing of this photo using facial recognition to find and deliver my photos from this event. I understand my biometric data will be stored securely and deleted when I request it.
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={mutation.isPending || !file}
                className="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Registering...
                  </span>
                ) : (
                  'Register for Event'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/events/${eventId}`)}
                className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {showEditor && preview && (
        <ImageEditor
          image={preview}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </div>
  )
}
