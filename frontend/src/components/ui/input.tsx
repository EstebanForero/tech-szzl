import * as React from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn('w-full border-0 bg-transparent font-mono text-2xl text-white outline-none placeholder:text-slate-500 focus-visible:outline-none disabled:opacity-50 sm:text-3xl', className)} {...props} />
}
