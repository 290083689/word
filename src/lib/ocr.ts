import Tesseract from 'tesseract.js'
import type { OcrStatus } from '@/store/appStore'

interface RecognizeOptions {
  onStatusChange: (status: OcrStatus) => void
  onProgress: (progress: number, message: string) => void
}

export async function recognizeImage(
  image: File | string,
  options: RecognizeOptions
): Promise<string> {
  const { onStatusChange, onProgress } = options

  onStatusChange('loading')
  onProgress(0, '正在初始化OCR引擎...')

  const result = await Tesseract.recognize(image, 'chi_sim+eng', {
    logger: (info) => {
      if (info.status === 'loading tesseract core') {
        onStatusChange('loading')
        onProgress(Math.round(info.progress * 30), '正在加载OCR核心...')
      } else if (info.status === 'initializing tesseract') {
        onStatusChange('loading')
        onProgress(30 + Math.round(info.progress * 10), '正在初始化引擎...')
      } else if (info.status === 'loading language traineddata') {
        onStatusChange('loading')
        onProgress(40 + Math.round(info.progress * 20), '正在加载语言包...')
      } else if (info.status === 'initializing api') {
        onStatusChange('loading')
        onProgress(60 + Math.round(info.progress * 10), '正在准备识别...')
      } else if (info.status === 'recognizing text') {
        onStatusChange('recognizing')
        onProgress(70 + Math.round(info.progress * 30), '正在识别文字...')
      }
    },
  })

  return result.data.text
}
