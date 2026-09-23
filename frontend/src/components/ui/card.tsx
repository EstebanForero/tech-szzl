import * as React from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('rounded-3xl border border-zinc-200/80 bg-white shadow-[0_18px_60px_-24px_rgba(31,31,60,0.15)]', className)} {...props} />
}
