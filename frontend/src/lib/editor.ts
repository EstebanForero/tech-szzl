export type EditResult = { value: string; cursor: number }

export function insertAtSelection(value: string, start: number, end: number, insertion: string): EditResult {
  return {
    value: value.slice(0, start) + insertion + value.slice(end),
    cursor: start + insertion.length,
  }
}

export function backspaceAtSelection(value: string, start: number, end: number): EditResult {
  const deleteFrom = start === end ? Math.max(0, start - 1) : start
  return {
    value: value.slice(0, deleteFrom) + value.slice(end),
    cursor: deleteFrom,
  }
}
