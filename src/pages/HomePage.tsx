import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useOCR } from '@/hooks/useOCR'
import ImageUploader from '@/components/ImageUploader'
import ImagePreview from '@/components/ImagePreview'
import OCRProgress from '@/components/OCRProgress'
import TableEditor from '@/components/TableEditor'
import Toolbar from '@/components/Toolbar'
import EmptyState from '@/components/EmptyState'
import { Table2, ScanText } from 'lucide-react'

export default function HomePage() {
  const { imageFile, ocrStatus, tableData } = useAppStore()
  const { startRecognition } = useOCR()

  const hasImage = !!imageFile
  const isProcessing = ocrStatus === 'loading' || ocrStatus === 'recognizing'
  const hasTable = tableData.length > 0
  const showEmptyState = !hasImage && !isProcessing && !hasTable

  useEffect(() => {
    if (imageFile && ocrStatus === 'idle') {
      startRecognition()
    }
  }, [imageFile, ocrStatus, startRecognition])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200">
              <Table2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-800 leading-tight">
                TableSnap
              </h1>
              <p className="text-[10px] text-zinc-400 leading-tight tracking-wide uppercase">
                Image to Excel
              </p>
            </div>
          </div>

          {hasImage && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <ScanText className="w-4 h-4" />
              <span>
                {isProcessing
                  ? '识别中...'
                  : hasTable
                  ? `${tableData.length} 行 × ${tableData[0]?.length || 0} 列`
                  : '等待识别'}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {showEmptyState && (
          <div className="mb-8">
            <ImageUploader />
          </div>
        )}

        {showEmptyState && <EmptyState />}

        {hasImage && (
          <div className="space-y-6">
            {!hasTable && (
              <div className="max-w-xl mx-auto">
                <ImageUploader />
              </div>
            )}

            <div className={`grid gap-6 ${hasTable ? 'lg:grid-cols-[340px_1fr]' : ''}`}>
              <div className="space-y-4">
                <ImagePreview />
                <OCRProgress />
              </div>

              {hasTable && (
                <div className="space-y-4">
                  <Toolbar />
                  <TableEditor />
                  <p className="text-xs text-zinc-400 text-center">
                    双击单元格可编辑内容 · 识别结果仅供参考，请检查后导出
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-100 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-zinc-400">
          所有数据仅在浏览器本地处理，不会上传至服务器
        </div>
      </footer>
    </div>
  )
}
