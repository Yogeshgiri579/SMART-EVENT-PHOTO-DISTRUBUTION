import { useState, useRef, useEffect } from 'react'

export default function ImageEditor({ image, onSave, onCancel }) {
  const canvasRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imgRef = useRef(null)

  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      imgRef.current = img
      canvas.width = 400
      canvas.height = 400
      drawImage(ctx, img)
    }

    img.src = image
  }, [image, scale, rotation, position])

  const drawImage = (ctx, img) => {
    if (!canvasRef.current) return
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.save()

    const centerX = canvasRef.current.width / 2
    const centerY = canvasRef.current.height / 2

    ctx.translate(centerX + position.x, centerY + position.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)

    const canvasSize = Math.min(canvasRef.current.width, canvasRef.current.height)
    const imgSize = Math.min(img.width, img.height)
    const scaleToFit = canvasSize / imgSize
    const size = imgSize * scaleToFit
    const x = -size / 2
    const y = -size / 2

    ctx.beginPath()
    ctx.arc(0, 0, canvasSize / 2, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(img, x, y, size, size)
    ctx.restore()
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    canvas.toBlob((blob) => {
      onSave(blob)
    }, 'image/jpeg', 0.95)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Edit Your Selfie</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-slate-100 rounded-lg p-4 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full rounded-lg cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </div>

          <div className="md:w-64 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Zoom: {Math.round(scale * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rotate: {rotation}°
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90) % 360)}
                  className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition"
                >
                  ↺ Left
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition"
                >
                  ↻ Right
                </button>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setScale(1)
                  setRotation(0)
                  setPosition({ x: 0, y: 0 })
                }}
                className="w-full px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition text-sm font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
