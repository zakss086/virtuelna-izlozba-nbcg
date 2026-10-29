import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import type { Library } from '../types'

type LibraryCardProps = {
  library: Library
  selected: boolean
  onSelect: (id: number) => void
}

// One library in the list: name, type, place and contact details where they are known.
export function LibraryCard({ library, selected, onSelect }: LibraryCardProps) {
  const { t } = useI18n()
  const place = library.address ? `${library.city}, ${library.address}` : library.city

  return (
    <li
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-4 transition-colors',
        selected ? 'border-accent bg-secondary' : 'bg-card',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg font-semibold">{library.name}</h3>
        <Badge variant={library.type === 'national' ? 'accent' : 'secondary'} className="shrink-0">
          {t(`libraries.type.${library.type}`)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{place}</p>

      <ul className="flex flex-col gap-1 text-sm">
        {library.phone && (
          <li className="flex items-center gap-2">
            <Phone className="size-4 text-gold" aria-hidden="true" />
            <span>{library.phone}</span>
          </li>
        )}
        {library.email && (
          <li className="flex items-center gap-2">
            <Mail className="size-4 text-gold" aria-hidden="true" />
            <span>{library.email}</span>
          </li>
        )}
      </ul>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        {library.location ? (
          <Button type="button" variant="outline" size="sm" onClick={() => onSelect(library.id)}>
            <MapPin />
            {t('libraries.showOnMap')}
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">{t('libraries.noPin')}</span>
        )}
        {library.website && (
          <Button asChild variant="ghost" size="sm">
            <a href={library.website} target="_blank" rel="noreferrer">
              <ExternalLink />
              {t('libraries.website')}
            </a>
          </Button>
        )}
      </div>
      {library.location?.precision === 'town' && (
        <p className="text-xs text-muted-foreground">{t('libraries.approx')}</p>
      )}
    </li>
  )
}
