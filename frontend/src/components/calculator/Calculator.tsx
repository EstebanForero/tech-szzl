import type { CalculatorClient } from '../../lib/api'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { CalculatorHelp } from './CalculatorHelp'
import { CalculatorKeypad } from './CalculatorKeypad'
import { maxExpressionLength, useCalculator } from './useCalculator'

type Props = { client: CalculatorClient }

function formatResult(value: number) {
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 12 }).format(value)
}

export function Calculator({ client }: Props) {
  const { expression, result, error, pending, inputRef, updateExpression, insert, backspace, clear, submit } = useCalculator(client)

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
                <Input ref={inputRef} id="expression" type="text" value={expression} onChange={(event) => updateExpression(event.target.value)} maxLength={maxExpressionLength} readOnly={pending} autoComplete="off" spellCheck={false} placeholder="0" className="mt-3" />
                <div className="mt-6 border-t border-white/10 pt-5 text-right" aria-live="polite">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Result</p>
                  <p className={`mt-2 break-all text-4xl font-semibold tracking-tight sm:text-5xl ${result === null ? 'text-slate-600' : 'text-emerald-300'}`}>{result === null ? '0' : formatResult(result)}</p>
                </div>
                {error && <p role="alert" className="mt-4 rounded-xl bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-200">{error}</p>}
              </div>

              <CalculatorKeypad pending={pending} onClear={clear} onBackspace={backspace} onInsert={insert} />
            </form>
          </Card>
          <CalculatorHelp />
        </div>
      </div>
    </main>
  )
}
