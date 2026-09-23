import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      default: 'bg-violet-700 text-white hover:bg-violet-800',
      accent: 'bg-emerald-300 text-slate-950 hover:bg-emerald-200',
      outline: 'border border-zinc-200 bg-white text-zinc-800 hover:border-violet-300 hover:bg-violet-50',
      ghost: 'text-zinc-600 hover:bg-zinc-100',
    },
    size: { default: 'h-11 px-5', icon: 'h-11 w-11', lg: 'h-13 px-6 text-base' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
