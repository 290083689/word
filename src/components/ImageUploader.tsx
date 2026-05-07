import { useCallback, useRef, useState } from 'react'
import { Upload, ImagePlus } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/bmp', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024

export default function ImageUploader() {
  const { setImageFile, setOcrStatus } = useAppStore()
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSetFile = useCallback(
    (file: File) => {
      setError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('不支持的文件格式，请上传 JPG/PNG/BMP/WebP 图片')
        return
      }

      if (file.size > MAX_SIZE) {
        setError('文件大小超过10MB限制')
        return
      }

      setImageFile(file)
      setOcrStatus('idle')
    },
    [setImageFile, setOcrStatus]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) validateAndSetFile(file)
    },
    [validateAndSetFile]
  )

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          w-full min-h-[200px] p-8
          border-2 border-dashed rounded-2xl cursor-pointer
          transition-all duration-300 ease-out
          ${
            isDragging
              ? 'border-emerald-400 bg-emerald-50/80 scale-[1.02] shadow-lg shadow-emerald-100'
              : 'border-zinc-300 bg-zinc-50/50 hover:border-emerald-300 hover:bg-emerald-50/30'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.bmp,.webp"
          onChange={handleChange}
          className="hidden"
        />

        <div
          className={`
            w-16 h-16 rounded-2xl flex items-center justify-center mb-4
            transition-all duration-300
            ${isDragging ? 'bg-emerald-100 scale-110' : 'bg-zinc-100'}
          `}
        >
          {isDragging ? (
            <ImagePlus className="w-8 h-8 text-emerald-600" />
          ) : (
            <Upload className="w-8 h-8 text-zinc-400" />
          )}
        </div>

        <p className="text-base font-medium text-zinc-700 mb-1">
          {isDragging ? '松开鼠标上传图片' : '拖拽图片到此处，或点击选择'}
        </p>
        <p className="text-sm text-zinc-400">
          支持 JPG / PNG / BMP / WebP，最大 10MB
        </p>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500 text-center animate-in fade-in">
          {error}
        </p>
      )}
    </div>
  )
}
