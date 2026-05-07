import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAppStore, type OcrStatus } from '@/store/appStore'

const statusConfig: Record<OcrStatus, { label: string; color: string }> = {
  idle: { label: '准备就绪', color: 'text-zinc-400' },
  loading: { label: '加载引擎中', color: 'text-amber-500' },
  recognizing: { label: '识别中', color: 'text-emerald-500' },
  done: { label: '识别完成', color: 'text-emerald-600' },
  error: { label: '识别失败', color: 'text-red-500' },
}

export default function OCRProgress() {
  const { ocrStatus, ocrProgress, ocrMessage } = useAppStore()

  if (ocrStatus === 'idle') return null

  const config = statusConfig[ocrStatus]
  const isActive = ocrStatus === 'loading' || ocrStatus === 'recognizing'

  return (
    <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isActive && (
            <Loader2 className={`w-4 h-4 ${config.color} animate-spin`} />
          )}
          {ocrStatus === 'done' && (
            <CheckCircle2 className={`w-4 h-4 ${config.color}`} />
          )}
          {ocrStatus === 'error' && (
            <AlertCircle className={`w-4 h-4 ${config.color}`} />
          )}
          <span className={`text-sm font-medium ${config.color}`}>
            {ocrMessage || config.label}
          </span>
        </div>
        <span className="text-sm font-mono text-zinc-400">
          {ocrProgress}%
        </span>
      </div>

      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${ocrStatus === 'error' ? 'bg-red-400' : 'bg-emerald-500'}
          `}
          style={{ width: `${ocrProgress}%` }}
        />
      </div>
    </div>
  )
}
