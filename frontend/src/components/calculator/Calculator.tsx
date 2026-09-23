import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowRight, CornerDownLeft, History, RotateCcw, Sparkles } from 'lucide-react'
import type { CalculatorClient } from '../../lib/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

type Props = { client: CalculatorClient }
type HistoryEntry = { expression: string; result: number }

const examples = [
  { label: 'Order of operations', expression: '2 + 3 * (4 - 1)' },
  { label: 'Powers and roots', expression: 'sqrt(144) + 2^3' },
  { label: 'Percentage of', expression: '20% of 50' },
  { label: 'Decimals', expression: '(18 / 3) - 1.5' },
]

function formatResult(value: number) {
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 12 }).format(value)
}

export function Calculator({ client }: Props) {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [evaluatedExpression, setEvaluatedExpression] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function updateExpression(value: string) {
    setExpression(value)
    setResult(null)
    setError('')
  }

  function clear() {
    updateExpression('')
    setEvaluatedExpression('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = expression.trim()
    setError('')
    setResult(null)
    if (!input) {
      setError('Enter an expression to calculate.')
      return
    }
    if (input.length > 256) {
      setError('Expressions must be 256 characters or fewer.')
      return
    }
    setPending(true)
    try {
      const answer = await client.evaluate(input)
      setResult(answer)
      setEvaluatedExpression(input)
      setHistory((previous) => [{ expression: input, result: answer }, ...previous].slice(0, 4))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Calculation failed.')
    } finally {
      setPending(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-bold text-emerald-300 shadow-lg shadow-slate-900/15">∑</span>
          <span className="text-2xl font-bold tracking-tight text-slate-950">sumly<span className="text-emerald-600">.</span></span>
        </div>
        <span className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-slate-500 sm:block">EXPRESSION WORKSPACE</span>
      </header>

      <div className="mb-10 max-w-3xl">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-800"><Sparkles size={14} /> Write a full expression</span>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">One expression. <span className="text-emerald-700">Every operation.</span></h1>
        <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg">Write a full expression and let the calculator work through it, in the right order.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(290px,1fr)]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-900 bg-slate-950 p-6 text-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.45)] sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Your expression</h2>
                <p className="mt-1 text-sm text-slate-400">Use numbers, operators, and parentheses.</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-400">01 / INPUT</span>
            </div>

            <form onSubmit={submit} noValidate>
              <Label htmlFor="expression" className="mb-2 block text-sm text-slate-300">Expression</Label>
              <Textarea id="expression" value={expression} onChange={(event) => updateExpression(event.target.value)} onKeyDown={handleKeyDown} maxLength={256} disabled={pending} spellCheck={false} placeholder="e.g. 2 + 3 * (4 - 1)" />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Ctrl/⌘ + Enter to calculate</span>
                <span>{expression.length}/256</span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button type="submit" variant="accent" size="lg" disabled={pending}>{pending ? 'Calculating…' : 'Evaluate expression'} {!pending && <ArrowRight size={18} />}</Button>
                <Button type="button" variant="ghost" onClick={clear} disabled={pending} className="text-slate-300 hover:bg-white/10 hover:text-white"><RotateCcw size={16} /> Clear</Button>
              </div>
              {error && <p role="alert" className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-200">{error}</p>}
            </form>

            <div className="mt-8 border-t border-white/10 pt-7" aria-live="polite">
              <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Result</p><span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-500">02 / ANSWER</span></div>
              {result === null ? <p className="mt-5 text-sm text-slate-500">Your answer will appear here.</p> : <div className="mt-4"><p className="break-all text-4xl font-bold tracking-tight text-emerald-300 sm:text-5xl">{formatResult(result)}</p><p className="mt-2 truncate font-mono text-sm text-slate-400">{evaluatedExpression}</p></div>}
            </div>
          </Card>

          {history.length > 0 && <Card className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900"><History size={18} className="text-emerald-700" /> Recent calculations</h2>
            <div className="space-y-2">
              {history.map((entry, index) => <button key={`${entry.expression}-${index}`} type="button" onClick={() => updateExpression(entry.expression)} disabled={pending} className="flex w-full items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-emerald-50 disabled:opacity-50" aria-label={`Reuse ${entry.expression}`}><span className="truncate font-mono text-sm text-slate-600">{entry.expression}</span><span className="shrink-0 text-sm font-bold text-slate-900">= {formatResult(entry.result)}</span></button>)}
            </div>
          </Card>}
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-base font-bold text-slate-900">Try an example</h2><CornerDownLeft size={17} className="text-slate-400" /></div>
            <div className="space-y-2">
              {examples.map((example) => <button key={example.expression} type="button" onClick={() => updateExpression(example.expression)} disabled={pending} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">{example.label}</span><span className="mt-1 block font-mono text-sm font-medium text-slate-800">{example.expression}</span></button>)}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="mb-4 text-base font-bold text-slate-900">Quick syntax</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <p><code className="mr-2 rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-900">+ − * /</code> Basic arithmetic</p>
              <p><code className="mr-2 rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-900">^</code> Powers, like 2^3</p>
              <p><code className="mr-2 rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-900">sqrt(...)</code> Square roots</p>
              <p><code className="mr-2 rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-900">% of</code> Percentages, like 20% of 50</p>
              <p><code className="mr-2 rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-900">(...)</code> Group operations</p>
            </div>
            <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">Write multiplication explicitly: 2 * (3 + 4). The backend checks syntax and evaluates each step.</p>
          </Card>
        </div>
      </div>
      <footer className="mt-10 text-center text-xs text-slate-400">Thoughtfully simple. Powered by a Go expression engine.</footer>
    </main>
  )
}
