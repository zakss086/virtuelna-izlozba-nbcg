import { useMemo } from 'react'

import { useI18n } from '@/lib/i18n'
import type { MapPlace } from '@/lib/map-place'

import { useExhibitions } from './use-exhibitions'

const NO_PLACES: MapPlace[] = []

// Places named in published exhibitions (the stops of "map story" exhibitions), for the interactive map.
export function useExhibitionPlaces() {
  const { l } = useI18n()
  const { data } = useExhibitions({ status: 'published' })

  return useMemo(() => {
    if (!data) return NO_PLACES
    return data.flatMap((exhibition) =>
      exhibition.sections.flatMap((section) =>
        section.place
          ? [
              {
                id: `exhibition-${exhibition.id}-${section.id}`,
                title: l(section.place.name),
                subtitle: l(exhibition.title),
                lat: section.place.lat,
                lng: section.place.lng,
                href: `/exhibitions/${exhibition.slug}`,
                imageUrl: section.items[0]?.imageUrl,
              },
            ]
          : [],
      ),
    )
  }, [data, l])
}
