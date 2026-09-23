import { useState } from 'react'
import { ChevronDown, CircleHelp } from 'lucide-react'

const examples = [
  { expression: '2(3 + 4)', description: 'Implicit multiplication' },
  { expression: '√(9 + 7)', description: 'Square root' },
  { expression: '20% × 50', description: 'Percentage' },
  { expression: '2^3^2', description: 'Powers, right to left' },
]

export function CalculatorHelp() {
  const [open, setOpen] = useState(false)

  return (
    <section className="mt-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="calculator-help"
        onClick={() => setOpen((current) => !current)}
        className="mx-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        <CircleHelp aria-hidden="true" className="h-4 w-4" />
        How to use
        <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div id="calculator-help" hidden={!open} className="mt-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <p className="font-semibold text-slate-900">Write a mathematical expression</p>
        <p className="mt-1">Type it directly or use the keypad, then press Enter or =. Parentheses set the order of operations.</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {examples.map(({ expression, description }) => (
            <div key={expression} className="rounded-xl bg-slate-50 px-3 py-2">
              <dt className="font-mono font-semibold text-slate-900">{expression}</dt>
              <dd className="mt-0.5 text-xs text-slate-500">{description}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-slate-500">You can also type *, /, and - instead of ×, ÷, and −.</p>
      </div>
    </section>
  )
}
