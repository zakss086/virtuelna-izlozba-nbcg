import { useId } from 'react'

import { cn } from '@/lib/utils'

type BraidDividerProps = { className?: string }

// A braided band (two crossing waves), echoing the interlace ornaments of medieval Montenegrin manuscripts.
// It fades out at both ends and is purely decorative.
export function BraidDivider({ className }: BraidDividerProps) {
  const id = useId()

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn('h-4 w-full text-accent', className)}
      style={{ maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)' }}
    >
      <defs>
        <pattern id={id} width="28" height="16" patternUnits="userSpaceOnUse">
          <path
            d="M0 8 C4.7 0 9.3 0 14 8 S23.3 16 28 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M0 8 C4.7 16 9.3 16 14 8 S23.3 0 28 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            opacity="0.55"
          />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill={`url(#${id})`} />
    </svg>
  )
}
