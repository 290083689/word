export function parseTableText(text: string): string[][] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) return []

  const rows: string[][] = []

  for (const line of lines) {
    let cells: string[]

    if (line.includes('\t')) {
      cells = line.split('\t').map((c) => c.trim())
    } else if (line.includes('|')) {
      cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
      if (cells.length <= 1) {
        cells = splitByMultipleSpaces(line)
      }
    } else {
      cells = splitByMultipleSpaces(line)
    }

    if (cells.length > 0) {
      rows.push(cells)
    }
  }

  const maxCols = Math.max(...rows.map((r) => r.length), 1)

  return rows.map((row) => {
    const padded = [...row]
    while (padded.length < maxCols) {
      padded.push('')
    }
    return padded
  })
}

function splitByMultipleSpaces(line: string): string[] {
  const cells = line
    .split(/\s{2,}/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0)

  if (cells.length <= 1) {
    const singleCells = line
      .split(/\s+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
    return singleCells.length > 1 ? singleCells : [line.trim()]
  }

  return cells
}
