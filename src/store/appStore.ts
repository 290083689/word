import { create } from 'zustand'

export type OcrStatus = 'idle' | 'loading' | 'recognizing' | 'done' | 'error'

interface AppState {
  imageFile: File | null
  imagePreviewUrl: string | null
  ocrStatus: OcrStatus
  ocrProgress: number
  ocrMessage: string
  tableData: string[][]
  setImageFile: (file: File | null) => void
  setOcrStatus: (status: OcrStatus) => void
  setOcrProgress: (progress: number, message?: string) => void
  setTableData: (data: string[][]) => void
  updateCell: (row: number, col: number, value: string) => void
  addRow: () => void
  addColumn: () => void
  deleteRow: (index: number) => void
  deleteColumn: (index: number) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  imageFile: null,
  imagePreviewUrl: null,
  ocrStatus: 'idle',
  ocrProgress: 0,
  ocrMessage: '',
  tableData: [],

  setImageFile: (file) =>
    set((state) => {
      if (state.imagePreviewUrl) {
        URL.revokeObjectURL(state.imagePreviewUrl)
      }
      return {
        imageFile: file,
        imagePreviewUrl: file ? URL.createObjectURL(file) : null,
        ocrStatus: 'idle',
        ocrProgress: 0,
        ocrMessage: '',
        tableData: [],
      }
    }),

  setOcrStatus: (status) => set({ ocrStatus: status }),

  setOcrProgress: (progress, message) =>
    set({ ocrProgress: progress, ocrMessage: message || '' }),

  setTableData: (data) => set({ tableData: data, ocrStatus: 'done' }),

  updateCell: (row, col, value) =>
    set((state) => {
      const newData = state.tableData.map((r, i) =>
        i === row ? r.map((c, j) => (j === col ? value : c)) : r
      )
      return { tableData: newData }
    }),

  addRow: () =>
    set((state) => {
      const cols = state.tableData[0]?.length || 1
      return { tableData: [...state.tableData, Array(cols).fill('')] }
    }),

  addColumn: () =>
    set((state) => {
      if (state.tableData.length === 0) {
        return { tableData: [['']] }
      }
      return {
        tableData: state.tableData.map((row) => [...row, '']),
      }
    }),

  deleteRow: (index) =>
    set((state) => ({
      tableData: state.tableData.filter((_, i) => i !== index),
    })),

  deleteColumn: (index) =>
    set((state) => ({
      tableData: state.tableData.map((row) => row.filter((_, j) => j !== index)),
    })),

  reset: () =>
    set((state) => {
      if (state.imagePreviewUrl) {
        URL.revokeObjectURL(state.imagePreviewUrl)
      }
      return {
        imageFile: null,
        imagePreviewUrl: null,
        ocrStatus: 'idle',
        ocrProgress: 0,
        ocrMessage: '',
        tableData: [],
      }
    }),
}))
