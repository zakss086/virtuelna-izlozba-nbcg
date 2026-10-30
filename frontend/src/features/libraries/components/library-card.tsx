import { Landmark, MapPin } from 'lucide-react'

import { SmartImage } from '@/components/smart-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import type { Library } from '../types'

type LibraryCardProps = {
  library: Library
  /** Straight-line distance from the visitor, when they allowed their position. */
  distanceKm?: number
  selected: boolean
  onSelect: (id: number) => void
}

// One library in the list: small photo (or a placeholder), name, type and place.
export function LibraryCard({ library, distanceKm, selected, onSelect }: LibraryCardProps) {
  const { t } = useI18n()
  const place = library.address ? `${library.city}, ${library.address}` : library.city

  return (
    <li
      className={cn(
        'relative flex gap-3 rounded-lg border p-3 transition-colors',
        selected ? 'border-accent bg-secondary' : 'bg-card hover:border-accent/60 hover:bg-secondary/40',
      )}
    >
      {library.image ? (
        <SmartImage src={library.image.url} alt="" className="size-16 shrink-0 rounded object-cover" />
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
          <Landmark className="size-6" aria-hidden="true" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base leading-snug font-semibold">
            {/* the whole card is clickable: this button stretches over it (the other button stays above) */}
            <button
              type="button"
              aria-current={selected}
              onClick={() => onSelect(library.id)}
              className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-ring"
            >
              {library.name}
            </button>
          </h3>
          <Badge variant={library.type === 'national' ? 'accent' : 'secondary'} className="shrink-0">
            {t(`libraries.type.${library.type}`)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {place}
          {distanceKm !== undefined && (
            <span className="ml-2 whitespace-nowrap text-gold">
              · {t('map.distance', { km: Math.max(1, Math.round(distanceKm)) })}
            </span>
          )}
        </p>
        <div className="mt-1">
          {library.location ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="relative z-10"
              aria-pressed={selected}
              onClick={() => onSelect(library.id)}
            >
              <MapPin />
              {t('libraries.showOnMap')}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">{t('libraries.noPin')}</span>
          )}
        </div>
      </div>
    </li>
  )
}
