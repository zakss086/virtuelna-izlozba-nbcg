import { Diamond } from 'lucide-react'

import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { LIBRARY_TYPES } from '../types'
import { TYPE_PIN_CLASSES, typeIconSvg } from './library-pin'

// What each pin on the map means: the four kinds of library and the places from exhibitions.
export function MapLegend() {
  const { t } = useI18n()

  return (
    <ul
      className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"
      aria-label={t('map.legendTitle')}
    >
      {LIBRARY_TYPES.map((type) => (
        <li key={type} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              'flex size-6 items-center justify-center rounded-full border-2 border-ink',
              TYPE_PIN_CLASSES[type],
            )}
            dangerouslySetInnerHTML={{ __html: typeIconSvg(type, 14) }}
          />
          {t(`libraries.type.${type}`)}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex size-6 items-center justify-center rounded-sm border-2 border-ink bg-gold text-on-ink"
        >
          <Diamond className="size-3" />
        </span>
        {t('map.layer.places')}
      </li>
    </ul>
  )
}
