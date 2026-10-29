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
        'flex items-center gap-3 rounded-lg border p-3',
        selected ? 'border-accent bg-secondary' : 'bg-card',
      )}
    >
      <Diamond className="size-5 shrink-0 text-gold" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-base leading-snug font-semibold">{place.title}</h3>
        <p className="text-sm text-muted-foreground">{place.subtitle}</p>
      </div>
      <Button type="button" variant="outline" size="sm" aria-pressed={selected} onClick={() => onSelect(place.id)}>
        {t('libraries.showOnMap')}
      </Button>
    </li>
  )
}
