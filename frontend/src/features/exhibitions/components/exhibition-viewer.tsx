import { lazy, Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import type { Exhibition } from '../types'
import { BookViewer } from './viewers/book-viewer'
import { CarouselViewer } from './viewers/carousel-viewer'
import { GalleryViewer } from './viewers/gallery-viewer'
import { SliderViewer } from './viewers/slider-viewer'
import { TimelineViewer } from './viewers/timeline-viewer'

// Heavy viewers (Leaflet, three.js) load only when an exhibition needs them.
const MapViewer = lazy(() => import('./viewers/map-viewer'))
const RoomViewer = lazy(() => import('./viewers/room-viewer'))

type ExhibitionViewerProps = { exhibition: Exhibition }

export function ExhibitionViewer({ exhibition }: ExhibitionViewerProps) {
  const { t } = useI18n()

  switch (exhibition.template) {
    case 'timeline':
      return <TimelineViewer exhibition={exhibition} />
    case 'gallery':
      return <GalleryViewer exhibition={exhibition} />
    case 'slider':
      return <SliderViewer exhibition={exhibition} />
    case 'book':
      return <BookViewer exhibition={exhibition} />
    case 'carousel':
      return <CarouselViewer exhibition={exhibition} />
    case 'map':
      return (
        <Suspense fallback={<Skeleton className="h-[60vh] w-full" aria-label={t('viewer.mapLoading')} />}>
          <MapViewer exhibition={exhibition} />
        </Suspense>
      )
    case 'room':
      return (
        <Suspense fallback={<Skeleton className="h-[60vh] w-full" aria-label={t('viewer.roomLoading')} />}>
          <RoomViewer exhibition={exhibition} />
        </Suspense>
      )
  }
}
