import { X, FileImage } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

export default function ImagePreview() {
  const { imagePreviewUrl, imageFile, reset } = useAppStore()

  if (!imagePreviewUrl) return null

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={reset}
          className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm
            flex items-center justify-center text-white/80
            hover:bg-black/60 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-center p-4 min-h-[200px] max-h-[400px] overflow-auto">
        <img
          src={imagePreviewUrl}
          alt="上传的表格图片"
          className="max-w-full max-h-[380px] object-contain rounded-lg shadow-sm"
        />
      </div>

      {imageFile && (
        <div className="px-4 py-3 border-t border-zinc-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <FileImage className="w-4 h-4" />
            <span className="truncate flex-1">{imageFile.name}</span>
            <span className="text-zinc-400">{formatSize(imageFile.size)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
