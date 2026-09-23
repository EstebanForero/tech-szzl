import * as React from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn('h-14 w-full rounded-xl border border-zinc-200 bg-white px-4 text-lg font-medium text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:opacity-50', className)} {...props} />
}
