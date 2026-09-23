import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react'
import { type CalculatorClient } from '../../lib/api'
import { getOperation, operations, type Operation } from '../../lib/operations'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

type Props = { client: CalculatorClient }

function parseOperand(value: string, label: string): number {
  if (value.trim() === '') throw new Error(`Enter ${label.toLowerCase()}.`)
  const number = Number(value)
  if (!Number.isFinite(number)) throw new Error(`${label} must be a finite number.`)
  return number
}

function formatResult(value: number) {
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 12 }).format(value)
}

export function Calculator({ client }: Props) {
  const [operation, setOperation] = useState<Operation>('add')
  const [first, setFirst] = useState('')
  const [second, setSecond] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const selected = getOperation(operation)
  const unary = operation === 'sqrt'

  function selectOperation(next: Operation) {
    setOperation(next)
    setResult(null)
    setError('')
  }

  function reset() {
    setFirst('')
    setSecond('')
    setResult(null)
    setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setResult(null)
    try {
      const operands = [parseOperand(first, 'First number')]
      if (!unary) operands.push(parseOperand(second, 'Second number'))
      if (operation === 'divide' && operands[1] === 0) throw new Error('Cannot divide by zero.')
      if (operation === 'sqrt' && operands[0] < 0) throw new Error('Square root requires a non-negative number.')
      setPending(true)
      setResult(await client.calculate(operation, operands))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Calculation failed.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-14">
      <header className="mb-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-700 text-2xl font-bold text-white shadow-lg shadow-violet-700/20">∑</span>
          <span className="text-2xl font-bold tracking-tight text-zinc-900">sumly<span className="text-violet-600">.</span></span>
        </div>
        <span className="hidden rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-zinc-500 sm:block">SIMPLE MATH, CLEAR ANSWERS</span>
      </header>

      <div className="mb-10 max-w-2xl">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-700"><Sparkles size={14} /> Your everyday calculator</span>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl">Make every number <span className="text-violet-700">make sense.</span></h1>
        <p className="mt-4 text-base leading-7 text-zinc-500 sm:text-lg">Choose an operation, enter your numbers, and get a clear answer in a moment.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-5 text-base font-bold text-zinc-900">Operations</h2>
          {(['basic', 'advanced'] as const).map((group) => (
            <div key={group} className="mb-5 last:mb-0">
              <p className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-zinc-400">{group}</p>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {operations.filter((item) => item.group === group).map((item) => (
                  <button key={item.id} type="button" aria-pressed={operation === item.id} disabled={pending} onClick={() => selectOperation(item.id)} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50 ${operation === item.id ? 'bg-violet-50 text-violet-800' : 'text-zinc-600 hover:bg-zinc-50'}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${operation === item.id ? 'bg-violet-700 text-white' : 'bg-zinc-100 text-zinc-500'}`}>{item.symbol}</span>
                    <span className="truncate">{item.label}</span>
                    {operation === item.id && <Check aria-hidden="true" size={16} className="ml-auto hidden lg:block" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-zinc-100 px-6 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-2xl font-bold text-violet-700">{selected.symbol}</span>
              <div><h2 className="text-2xl font-bold tracking-tight text-zinc-900">{selected.label}</h2><p className="mt-1 text-sm text-zinc-500">{selected.description}</p></div>
            </div>
          </div>
          <form onSubmit={submit} noValidate className="px-6 py-7 sm:px-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="first-number">{unary ? 'Number' : 'First number'}</Label><Input id="first-number" inputMode="decimal" type="number" step="any" placeholder="e.g. 24" value={first} onChange={(event) => setFirst(event.target.value)} disabled={pending} /></div>
              {!unary && <div className="space-y-2"><Label htmlFor="second-number">{operation === 'power' ? 'Exponent' : operation === 'percent' ? 'Of number' : 'Second number'}</Label><Input id="second-number" inputMode="decimal" type="number" step="any" placeholder="e.g. 8" value={second} onChange={(event) => setSecond(event.target.value)} disabled={pending} /></div>}
            </div>
            {operation === 'percent' && <p className="mt-3 text-sm text-zinc-500">Find the first number as a percentage of the second.</p>}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button type="submit" size="lg" disabled={pending}>{pending ? 'Calculating…' : 'Calculate'} {!pending && <ArrowRight size={18} />}</Button>
              <Button type="button" variant="ghost" onClick={reset} disabled={pending}><RotateCcw size={16} /> Clear</Button>
            </div>
            {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
          </form>
          <div className="min-h-40 border-t border-zinc-100 bg-zinc-50/70 px-6 py-7 sm:px-8" aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Result</p>
            {result === null ? <p className="mt-4 text-sm text-zinc-400">Your answer will appear here.</p> : <div className="mt-3 flex items-baseline gap-3"><span className="text-4xl font-bold tracking-tight text-violet-700 sm:text-5xl">{formatResult(result)}</span><span className="text-sm font-medium text-zinc-400">answer</span></div>}
          </div>
        </Card>
      </div>
      <footer className="mt-10 text-center text-xs text-zinc-400">Thoughtfully simple. Powered by a Go API.</footer>
    </main>
  )
}
