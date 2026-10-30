import { BookOpen, X } from 'lucide-react'
import { Link } from 'react-router'

import { SmartImage } from '@/components/smart-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import type { MapPlace } from '@/lib/map-place'

type PlaceDetailProps = {
  place: MapPlace
  /** Which stop of the exhibition's route this is, when the exhibition has several places. */
  stop?: { n: number; total: number }
  onClose: () => void
}

// Card for a place that appears in an exhibition, with a link back to that exhibition.
export function PlaceDetail({ place, stop, onClose }: PlaceDetailProps) {
  const { t } = useI18n()

  return (
    <article className="overflow-hidden rounded-lg border border-accent bg-card" aria-label={place.title}>
      {place.imageUrl && (
        <SmartImage src={place.imageUrl} alt={place.title} className="aspect-[16/9] w-full object-cover" />
      )}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="secondary">
              {stop ? t('map.stop', { n: stop.n, total: stop.total }) : t('map.exhibitionPlace')}
            </Badge>
            <h2 className="mt-2 text-xl font-semibold">{place.title}</h2>
            <p className="text-sm text-muted-foreground">{place.subtitle}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label={t('viewer.close')} onClick={onClose}>
            <X />
          </Button>
        </div>
        <Button asChild className="w-fit">
          <Link to={place.href}>
            <BookOpen />
            {t('map.openExhibition')}
          </Link>
        </Button>
      </div>
    </article>
  )
}
