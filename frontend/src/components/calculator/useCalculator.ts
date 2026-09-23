import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import type { CalculatorClient } from '../../lib/api'
import { backspaceAtSelection, insertAtSelection, type EditResult } from '../../lib/editor'

export const maxExpressionLength = 256

export function useCalculator(client: CalculatorClient) {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextCursor = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (nextCursor.current !== null) {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(nextCursor.current, nextCursor.current)
      nextCursor.current = null
    }
  }, [expression])

  function updateExpression(value: string) {
    setExpression(value)
    setResult(null)
    setError('')
  }

  function selection() {
    const start = inputRef.current?.selectionStart ?? expression.length
    const end = inputRef.current?.selectionEnd ?? expression.length
    return { start, end }
  }

  function applyEdit(edit: EditResult) {
    if (edit.value.length > maxExpressionLength) {
      setError(`Expressions must be ${maxExpressionLength} characters or fewer.`)
      return
    }
    nextCursor.current = edit.cursor
    updateExpression(edit.value)
  }

  function insert(value: string) {
    const { start, end } = selection()
    applyEdit(insertAtSelection(expression, start, end, value))
  }

  function backspace() {
    const { start, end } = selection()
    applyEdit(backspaceAtSelection(expression, start, end))
  }

  function clear() {
    nextCursor.current = 0
    updateExpression('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const source = expression.trim()
    setResult(null)
    setError('')
    if (!source) {
      setError('Enter an expression.')
      return
    }
    setPending(true)
    try {
      setResult(await client.evaluate(source))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Calculation failed.')
    } finally {
      setPending(false)
    }
  }

  return { expression, result, error, pending, inputRef, updateExpression, insert, backspace, clear, submit }
}
