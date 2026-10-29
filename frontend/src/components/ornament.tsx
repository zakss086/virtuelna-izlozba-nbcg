import { cn } from '@/lib/utils'

type OrnamentProps = { className?: string }

// Small manuscript-style divider: a gold hairline, a diamond and a short tail.
export function Ornament({ className }: OrnamentProps) {
  return (
    <div aria-hidden="true" className={cn('mt-3 flex items-center gap-2 text-gold', className)}>
      <span className="h-px w-12 bg-accent" />
      <span className="size-1.5 rotate-45 bg-cinnabar" />
      <span className="h-px w-4 bg-accent/60" />
    </div>
  )
}
