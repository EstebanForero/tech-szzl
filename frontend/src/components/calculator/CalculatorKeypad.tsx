import { Button } from '../ui/button'

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

type Props = {
  pending: boolean
  onClear: () => void
  onBackspace: () => void
  onInsert: (value: string) => void
}

export function CalculatorKeypad({ pending, onClear, onBackspace, onInsert }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 p-2 pt-4 sm:gap-3 sm:p-3 sm:pt-5">
      {keys.map((key) => (
        <Button
          key={key.label}
          type={key.action === 'evaluate' ? 'submit' : 'button'}
          variant={key.tone ?? 'key'}
          aria-label={key.ariaLabel}
          disabled={pending}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (key.action === 'clear') onClear()
            else if (key.action === 'backspace') onBackspace()
            else if (key.value !== undefined) onInsert(key.value)
          }}
          className={`h-14 rounded-2xl text-xl font-semibold focus-visible:ring-emerald-200 sm:h-16 ${key.wide ? 'col-span-2' : ''}`}
        >
          {key.label}
        </Button>
      ))}
    </div>
  )
}
