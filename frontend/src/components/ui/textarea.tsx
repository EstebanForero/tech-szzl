import * as React from 'react'
import { cn } from '../../lib/utils'

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cn('min-h-36 w-full resize-y rounded-2xl border border-white/15 bg-white/5 px-5 py-4 font-mono text-xl leading-relaxed text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 disabled:opacity-50', className)} {...props} />
}
