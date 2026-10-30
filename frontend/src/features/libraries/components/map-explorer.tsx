import { LocateFixed, Search } from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'

import { ErrorNotice } from '@/components/error-notice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { nearestTo } from '@/lib/geo'
import { useI18n } from '@/lib/i18n'
import type { MapPlace } from '@/lib/map-place'
import { normalizeText } from '@/lib/text'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

import { useLibraries } from '../api/use-libraries'
import { LIBRARY_TYPES, type Library, type LibraryType, type MapSelection } from '../types'
import { LibraryCard } from './library-card'
import { LibraryDetail } from './library-detail'
import { PlaceCard } from './place-card'
import { PlaceDetail } from './place-detail'

const MapCanvas = lazy(() => import('./map-canvas'))

type MapExplorerProps = {
  /** Places named in exhibitions; the route supplies them so this feature does not depend on exhibitions. */
  places: MapPlace[]
  /** Extra actions under the selected library (the route puts an admin's "Edit" here). */
  renderLibraryActions?: (library: Library) => ReactNode
}

function matchesLibrary(library: Library, query: string, type: LibraryType | undefined) {
  if (type && library.type !== type) return false
  if (!query) return true
  return normalizeText(`${library.name} ${library.city}`).includes(normalizeText(query))
}

function matchesPlace(place: MapPlace, query: string) {
  if (!query) return true
  return normalizeText(`${place.title} ${place.subtitle}`).includes(normalizeText(query))
}

const pillClass = (active: boolean) =>
  cn(
    'rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring',
    active ? 'border-accent bg-accent text-accent-foreground' : 'hover:bg-muted',
  )

// Interactive map of libraries and places from exhibitions, with search, filters, details and "nearest library".
export function MapExplorer({ places, renderLibraryActions }: MapExplorerProps) {
  const { t } = useI18n()
  const { data, isPending, isError, refetch } = useLibraries()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<LibraryType | undefined>(undefined)
  const [showLibraries, setShowLibraries] = useState(true)
  const [showPlaces, setShowPlaces] = useState(true)
  const [placeId, setPlaceId] = useState<string | undefined>(undefined)
  const [locating, setLocating] = useState(false)
  const [nearest, setNearest] = useState<{ name: string; km: number } | undefined>(undefined)
  const sideRef = useRef<HTMLDivElement>(null)
  const selectedLibraryParam = params.get('library')

  // A new selection puts its detail card at the top of the side panel, so scroll back there.
  useEffect(() => {
    sideRef.current?.scrollTo({ top: 0 })
  }, [selectedLibraryParam, placeId])

  if (isPending) {
    return <Skeleton className="h-[60vh] w-full" aria-busy="true" aria-label={t('common.loading')} />
  }
  if (isError) return <ErrorNotice onRetry={() => refetch()} />

  const allLibraries = data
  const libraryId = Number(params.get('library')) || undefined
  const selection: MapSelection | undefined = placeId
    ? { kind: 'place', id: placeId }
    : libraryId
      ? { kind: 'library', id: libraryId }
      : undefined

  const trimmed = query.trim()
  const libraries = showLibraries ? data.filter((library) => matchesLibrary(library, trimmed, type)) : []
  const shownPlaces = showPlaces ? places.filter((place) => matchesPlace(place, trimmed)) : []
  const selectedLibrary = selection?.kind === 'library' ? data.find((item) => item.id === selection.id) : undefined
  const selectedPlace = selection?.kind === 'place' ? places.find((item) => item.id === selection.id) : undefined

  function select(next: MapSelection | undefined) {
    const copy = new URLSearchParams(params)
    if (next?.kind === 'library') copy.set('library', String(next.id))
    else copy.delete('library')
    setPlaceId(next?.kind === 'place' ? next.id : undefined)
    setParams(copy, { replace: true })
  }

  function findNearest() {
    if (!('geolocation' in navigator)) {
      showToast('error', t('map.locationFailed'))
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        const from = { lat: position.coords.latitude, lng: position.coords.longitude }
        const best = nearestTo(from, allLibraries, (library) => library.location)
        if (!best) return
        setNearest({ name: best.item.name, km: Math.round(best.km) })
        setShowLibraries(true)
        setQuery('')
        setType(undefined)
        select({ kind: 'library', id: best.item.id })
      },
      () => {
        setLocating(false)
        showToast('error', t('map.locationFailed'))
      },
      { timeout: 10000 },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Label htmlFor="map-search" className="sr-only">
              {t('map.search')}
            </Label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="map-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('map.search')}
              className="pl-9"
            />
          </div>
          <Button type="button" variant="outline" disabled={locating} onClick={findNearest}>
            <LocateFixed />
            {locating ? t('map.locating') : t('map.nearest')}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label={t('map.layers')}>
          <button
            type="button"
            aria-pressed={showLibraries}
            onClick={() => setShowLibraries((value) => !value)}
            className={pillClass(showLibraries)}
          >
            {t('map.layer.libraries')}
          </button>
          <button
            type="button"
            aria-pressed={showPlaces}
            onClick={() => setShowPlaces((value) => !value)}
            className={pillClass(showPlaces)}
          >
            {t('map.layer.places')}
          </button>
        </div>

        {showLibraries && (
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('libraries.filter')}>
            {[undefined, ...LIBRARY_TYPES].map((option) => (
              <button
                key={option ?? 'all'}
                type="button"
                aria-pressed={type === option}
                onClick={() => setType(option)}
                className={pillClass(type === option)}
              >
                {option ? t(`libraries.type.${option}`) : t('libraries.type.all')}
              </button>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground" role="status">
          {nearest
            ? t('map.nearestResult', { name: nearest.name, km: nearest.km })
            : t('map.count', { libraries: libraries.length, places: shownPlaces.length })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="lg:order-2">
          <Suspense fallback={<Skeleton className="h-[55vh] w-full lg:h-[70vh]" aria-label={t('map.loading')} />}>
            <MapCanvas libraries={libraries} places={shownPlaces} selection={selection} onSelect={select} />
          </Suspense>
          <p className="mt-2 text-xs text-muted-foreground">{t('map.legend')}</p>
        </div>

        <div ref={sideRef} className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto pr-2 [overflow-anchor:none] *:shrink-0 lg:order-1">
          {selectedLibrary && <LibraryDetail library={selectedLibrary} onClose={() => select(undefined)} />}
          {selectedLibrary && renderLibraryActions?.(selectedLibrary)}
          {selectedPlace && <PlaceDetail place={selectedPlace} onClose={() => select(undefined)} />}
          {!selectedLibrary && !selectedPlace && (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{t('map.hint')}</p>
          )}

          {libraries.length === 0 && shownPlaces.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-muted-foreground">{t('libraries.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {libraries.map((library) => (
                <LibraryCard
                  key={library.id}
                  library={library}
                  selected={selection?.kind === 'library' && selection.id === library.id}
                  onSelect={(id) => select({ kind: 'library', id })}
                />
              ))}
            </ul>
          )}

          {shownPlaces.length > 0 && (
            <section aria-labelledby="map-places" className="flex flex-col gap-3">
              <h2 id="map-places" className="font-heading text-xl font-semibold">
                {t('map.layer.places')}
              </h2>
              <ul className="flex flex-col gap-3">
                {shownPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    selected={selection?.kind === 'place' && selection.id === place.id}
                    onSelect={(id) => select({ kind: 'place', id })}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
