import { describe, expect, it } from 'vitest'
import { backspaceAtSelection, insertAtSelection } from './editor'

describe('keypad editing', () => {
  it('inserts at the cursor or replaces a selection', () => {
    expect(insertAtSelection('2+4', 2, 2, '3×')).toEqual({ value: '2+3×4', cursor: 4 })
    expect(insertAtSelection('2+4', 2, 3, '5')).toEqual({ value: '2+5', cursor: 3 })
  })

  it('deletes the selected text or the preceding character', () => {
    expect(backspaceAtSelection('12+3', 4, 4)).toEqual({ value: '12+', cursor: 3 })
    expect(backspaceAtSelection('12+3', 1, 3)).toEqual({ value: '13', cursor: 1 })
    expect(backspaceAtSelection('12', 0, 0)).toEqual({ value: '12', cursor: 0 })
  })
})
