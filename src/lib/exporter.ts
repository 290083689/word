import * as XLSX from 'xlsx'

export function exportToExcel(tableData: string[][], filename?: string): void {
  if (tableData.length === 0) return

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(tableData)

  const colWidths: XLSX.ColInfo[] = []
  const maxCols = Math.max(...tableData.map((r) => r.length))

  for (let col = 0; col < maxCols; col++) {
    let maxLen = 8
    for (const row of tableData) {
      if (row[col]) {
        const len = row[col].length
        if (len > maxLen) maxLen = Math.min(len, 50)
      }
    }
    colWidths.push({ wch: maxLen + 2 })
  }
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
  const finalFilename = filename || `table-export-${timestamp}.xlsx`

  XLSX.writeFile(wb, finalFilename)
}
