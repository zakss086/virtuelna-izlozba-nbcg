import { SmartImage } from '@/components/smart-image'
import { MoveHorizontal } from 'lucide-react'
import { useState } from 'react'

import { useI18n } from '@/lib/i18n'

import type { ExhibitionItem } from '../../types'

type CompareSliderProps = { before: ExhibitionItem; after: ExhibitionItem }

export function CompareSlider({ before, after }: CompareSliderProps) {
  const { t, l } = useI18n()
  const [position, setPosition] = useState(50)

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-ink select-none">
        <SmartImage
          src={after.imageUrl}
          alt={l(after.title)}
          className="absolute inset-0 size-full object-cover"
        />
        <SmartImage
          src={before.imageUrl}
          alt={l(before.title)}
          className="absolute inset-0 size-full object-cover"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent"
          style={{ left: `${position}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
            <MoveHorizontal className="size-5" />
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label={t('viewer.compare')}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
        {before.year && (
          <span className="absolute left-3 top-3 rounded bg-ink/80 px-2 py-1 text-xs text-on-ink">
            {before.year}
          </span>
        )}
        {after.year && (
          <span className="absolute right-3 top-3 rounded bg-ink/80 px-2 py-1 text-xs text-on-ink">
            {after.year}
          </span>
        )}
      </div>
      <figcaption className="text-sm text-muted-foreground">{t('viewer.compare')}</figcaption>
    </figure>
  )
}
