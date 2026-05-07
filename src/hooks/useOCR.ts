import { useCallback } from 'react'
import { useAppStore } from '@/store/appStore'
import { recognizeImage } from '@/lib/ocr'
import { parseTableText } from '@/lib/parser'

export function useOCR() {
  const { imageFile, setOcrStatus, setOcrProgress, setTableData } = useAppStore()

  const startRecognition = useCallback(async () => {
    if (!imageFile) return

    try {
      const text = await recognizeImage(imageFile, {
        onStatusChange: setOcrStatus,
        onProgress: setOcrProgress,
      })

      const tableData = parseTableText(text)

      if (tableData.length === 0) {
        setOcrStatus('error')
        setOcrProgress(0, '未能识别到表格内容，请尝试更清晰的图片')
        return
      }

      setTableData(tableData)
    } catch {
      setOcrStatus('error')
      setOcrProgress(0, '识别失败，请重试')
    }
  }, [imageFile, setOcrStatus, setOcrProgress, setTableData])

  return { startRecognition }
}
