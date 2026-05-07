import {
  Plus,
  Minus,
  Trash2,
  Download,
  Rows3,
  Columns3,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { exportToExcel } from '@/lib/exporter'

export default function Toolbar() {
  const { tableData, addRow, addColumn, deleteRow, deleteColumn } = useAppStore()

  const handleExport = () => {
    if (tableData.length === 0) return
    exportToExcel(tableData)
  }

  const lastRowIndex = tableData.length - 1
  const lastColIndex = tableData[0]?.length ? tableData[0].length - 1 : -1

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        <button
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5
            text-sm font-medium text-zinc-600 bg-white border border-zinc-200
            rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all"
        >
          <Rows3 className="w-4 h-4" />
          添加行
        </button>
        <button
          onClick={addColumn}
          className="inline-flex items-center gap-1.5 px-3 py-1.5
            text-sm font-medium text-zinc-600 bg-white border border-zinc-200
            rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all"
        >
          <Columns3 className="w-4 h-4" />
          添加列
        </button>
      </div>

      <div className="w-px h-6 bg-zinc-200" />

      <div className="flex items-center gap-1">
        <button
          onClick={() => lastRowIndex >= 0 && deleteRow(lastRowIndex)}
          disabled={lastRowIndex < 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5
            text-sm font-medium text-zinc-600 bg-white border border-zinc-200
            rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
          删除末行
        </button>
        <button
          onClick={() => lastColIndex >= 0 && deleteColumn(lastColIndex)}
          disabled={lastColIndex < 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5
            text-sm font-medium text-zinc-600 bg-white border border-zinc-200
            rounded-lg hover:bg-zinc-50 hover:border-zinc-300 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
          删除末列
        </button>
      </div>

      <div className="w-px h-6 bg-zinc-200" />

      <button
        onClick={() => useAppStore.getState().setTableData([])}
        disabled={tableData.length === 0}
        className="inline-flex items-center gap-1.5 px-3 py-1.5
          text-sm font-medium text-red-500 bg-white border border-zinc-200
          rounded-lg hover:bg-red-50 hover:border-red-200 transition-all
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" />
        清空
      </button>

      <div className="flex-1" />

      <button
        onClick={handleExport}
        disabled={tableData.length === 0}
        className="inline-flex items-center gap-2 px-5 py-2
          text-sm font-semibold text-white bg-emerald-500
          rounded-xl hover:bg-emerald-600 active:bg-emerald-700
          shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200
          transition-all disabled:opacity-40 disabled:cursor-not-allowed
          disabled:shadow-none"
      >
        <Download className="w-4 h-4" />
        导出 Excel
      </button>
    </div>
  )
}
