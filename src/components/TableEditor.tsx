import { useState, useCallback } from 'react'
import { useAppStore } from '@/store/appStore'

export default function TableEditor() {
  const { tableData, updateCell } = useAppStore()
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEditing = useCallback(
    (row: number, col: number) => {
      setEditingCell({ row, col })
      setEditValue(tableData[row]?.[col] || '')
    },
    [tableData]
  )

  const commitEdit = useCallback(() => {
    if (editingCell) {
      updateCell(editingCell.row, editingCell.col, editValue)
      setEditingCell(null)
    }
  }, [editingCell, editValue, updateCell])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitEdit()
      } else if (e.key === 'Escape') {
        setEditingCell(null)
      }
    },
    [commitEdit]
  )

  if (tableData.length === 0) return null

  return (
    <div className="w-full overflow-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full border-collapse min-w-max">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200">
            <th className="w-12 px-3 py-2 text-xs font-medium text-zinc-400 text-center border-r border-zinc-100">
              #
            </th>
            {tableData[0]?.map((_, colIdx) => (
              <th
                key={colIdx}
                className="px-3 py-2 text-xs font-medium text-zinc-400 text-center border-r border-zinc-100 last:border-r-0"
              >
                {String.fromCharCode(65 + (colIdx % 26))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`
                border-b border-zinc-100 last:border-b-0
                ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}
                hover:bg-emerald-50/40 transition-colors
              `}
            >
              <td className="px-3 py-2 text-xs text-zinc-400 text-center border-r border-zinc-100 font-mono">
                {rowIdx + 1}
              </td>
              {row.map((cell, colIdx) => (
                <td
                  key={colIdx}
                  className={`
                    px-3 py-2 text-sm border-r border-zinc-100 last:border-r-0
                    ${
                      editingCell?.row === rowIdx && editingCell?.col === colIdx
                        ? 'p-0'
                        : 'cursor-pointer hover:bg-emerald-50/60'
                    }
                  `}
                  onDoubleClick={() => startEditing(rowIdx, colIdx)}
                >
                  {editingCell?.row === rowIdx && editingCell?.col === colIdx ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="w-full px-3 py-2 text-sm bg-emerald-50 border-2 border-emerald-400
                        outline-none rounded-none"
                    />
                  ) : (
                    <span className={cell ? 'text-zinc-800' : 'text-zinc-300'}>
                      {cell || '—'}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
