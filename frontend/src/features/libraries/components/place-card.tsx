import { Diamond } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import type { MapPlace } from '@/lib/map-place'
import { cn } from '@/lib/utils'

type PlaceCardProps = {
  place: MapPlace
  selected: boolean
  onSelect: (id: string) => void
}

// One place from an exhibition in the list next to the map (also usable without a mouse).
export function PlaceCard({ place, selected, onSelect }: PlaceCardProps) {
  const { t } = useI18n()

  return (
    <li
      className={cn(
        'relative flex items-center gap-3 rounded-lg border p-3 transition-colors',
        selected ? 'border-accent bg-secondary' : 'bg-card hover:border-accent/60 hover:bg-secondary/40',
      )}
    >
      <Diamond className="size-5 shrink-0 text-gold" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-base leading-snug font-semibold">
          <button
            type="button"
            aria-current={selected}
            onClick={() => onSelect(place.id)}
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-ring"
          >
            {place.title}
          </button>
        </h3>
        <p className="text-sm text-muted-foreground">{place.subtitle}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="relative z-10"
        aria-pressed={selected}
        onClick={() => onSelect(place.id)}
      >
        {t('libraries.showOnMap')}
      </Button>
    </li>
  )
}
