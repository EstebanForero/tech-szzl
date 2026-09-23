import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import type { CalculatorClient } from '../../lib/api'
import { backspaceAtSelection, insertAtSelection, type EditResult } from '../../lib/editor'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

type Props = { client: CalculatorClient }
type Key = {
  label: string
  value?: string
  action?: 'clear' | 'backspace' | 'evaluate'
  ariaLabel?: string
  tone?: 'key' | 'operator' | 'accent'
  wide?: boolean
}

const keys: Key[] = [
  { label: 'AC', action: 'clear', ariaLabel: 'Clear', tone: 'operator' },
  { label: '(', value: '(', tone: 'operator' },
  { label: ')', value: ')', tone: 'operator' },
  { label: '⌫', action: 'backspace', ariaLabel: 'Backspace', tone: 'operator' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '÷', value: '÷', ariaLabel: 'Divide', tone: 'operator' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '×', value: '×', ariaLabel: 'Multiply', tone: 'operator' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '−', value: '−', ariaLabel: 'Subtract', tone: 'operator' },
  { label: '√', value: '√', ariaLabel: 'Square root', tone: 'operator' },
  { label: '0', value: '0' },
  { label: '.', value: '.', ariaLabel: 'Decimal point' },
  { label: '+', value: '+', ariaLabel: 'Add', tone: 'operator' },
  { label: '%', value: '%', ariaLabel: 'Percent', tone: 'operator' },
  { label: '^', value: '^', ariaLabel: 'Power', tone: 'operator' },
  { label: '=', action: 'evaluate', ariaLabel: 'Equals', tone: 'accent', wide: true },
]

function formatResult(value: number) {
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 12 }).format(value)
}

export function Calculator({ client }: Props) {
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
    if (edit.value.length > 256) {
      setError('Expressions must be 256 characters or fewer.')
      return
    }
    nextCursor.current = edit.cursor
    updateExpression(edit.value)
  }

  function handleKey(key: Key) {
    if (key.action === 'clear') {
      nextCursor.current = 0
      updateExpression('')
      return
    }
    const { start, end } = selection()
    if (key.action === 'backspace') {
      applyEdit(backspaceAtSelection(expression, start, end))
    } else if (key.value !== undefined) {
      applyEdit(insertAtSelection(expression, start, end, key.value))
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = expression.trim()
    setResult(null)
    setError('')
    if (!input) {
      setError('Enter an expression.')
      return
    }
    setPending(true)
    try {
      setResult(await client.evaluate(input))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Calculation failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-7 sm:px-8 sm:py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-xl font-bold text-emerald-300">∑</span>
          <span className="text-xl font-bold tracking-tight text-slate-950">sumly<span className="text-emerald-600">.</span></span>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Expression calculator</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center py-10 sm:py-14">
        <div className="w-full max-w-[470px]">
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Calculate freely.</h1>
            <p className="mt-2 text-sm text-slate-500">Type an expression or use the keypad.</p>
          </div>

          <Card className="overflow-hidden rounded-[2rem] border-slate-200 p-3 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.25)] sm:p-4">
            <form onSubmit={submit} noValidate>
              <div className="rounded-[1.5rem] bg-slate-950 px-5 py-6 text-white sm:px-6">
                <Label htmlFor="expression" className="text-xs font-semibold uppercase tracking-widest text-slate-400">Expression</Label>
                <Input ref={inputRef} id="expression" type="text" value={expression} onChange={(event) => updateExpression(event.target.value)} maxLength={256} disabled={pending} autoComplete="off" spellCheck={false} placeholder="0" className="mt-3" />
                <div className="mt-6 border-t border-white/10 pt-5 text-right" aria-live="polite">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Result</p>
                  <p className={`mt-2 break-all text-4xl font-semibold tracking-tight sm:text-5xl ${result === null ? 'text-slate-600' : 'text-emerald-300'}`}>{result === null ? '0' : formatResult(result)}</p>
                </div>
                {error && <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-200">{error}</p>}
              </div>

              <div className="grid grid-cols-4 gap-2 p-2 pt-4 sm:gap-3 sm:p-3 sm:pt-5">
                {keys.map((key) => <Button key={key.label} type={key.action === 'evaluate' ? 'submit' : 'button'} variant={key.tone ?? 'key'} aria-label={key.ariaLabel} disabled={pending} onMouseDown={(event) => event.preventDefault()} onClick={key.action === 'evaluate' ? undefined : () => handleKey(key)} className={`h-14 rounded-2xl text-xl font-semibold focus-visible:ring-emerald-200 sm:h-16 ${key.wide ? 'col-span-2' : ''}`}>{key.label}</Button>)}
              </div>
            </form>
          </Card>
          <p className="mt-5 text-center text-xs leading-5 text-slate-400">Supports parentheses, powers, roots, percentages, and implicit multiplication.</p>
        </div>
      </div>
    </main>
  )
}
