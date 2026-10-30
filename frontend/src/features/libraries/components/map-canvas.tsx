import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Maximize } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'

import { useI18n } from '@/lib/i18n'
import type { MapPlace } from '@/lib/map-place'
import { MAP_ROUTE_COLOR } from '@/lib/scene-palette'

import type { Library, MapSelection } from '../types'
import { TYPE_PIN_CLASSES, typeIconSvg } from './library-pin'

type MapCanvasProps = {
  libraries: Library[]
  places: MapPlace[]
  /** The stops of the selected place's exhibition, in order; drawn as a route when there are at least two. */
  route: MapPlace[]
  selection: MapSelection | undefined
  onSelect: (selection: MapSelection) => void
}

// South-west and north-east corners that frame the whole country.
const MONTENEGRO_BOUNDS: [[number, number], [number, number]] = [
  [41.85, 18.4],
  [43.55, 20.4],
]
// The map cannot be dragged far from Montenegro and its neighbours.
const MAX_BOUNDS: [[number, number], [number, number]] = [
  [40.6, 16.6],
  [44.8, 22.2],
]

function FlyToSelection({ target }: { target: [number, number] | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 11, { duration: 1 })
  }, [target, map])
  return null
}

// The map can start hidden (the list/map switch on phones); it re-measures itself when it becomes visible.
function KeepSize() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])
  return null
}

function ResetView() {
  const map = useMap()
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) L.DomEvent.disableClickPropagation(ref.current)
  }, [])

  return (
    <div ref={ref} className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button
          type="button"
          title={t('map.reset')}
          aria-label={t('map.reset')}
          onClick={() => map.flyToBounds(MONTENEGRO_BOUNDS, { duration: 0.8 })}
          className="flex size-[30px] items-center justify-center bg-card text-card-foreground hover:bg-muted"
        >
          <Maximize className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// Pins are told apart by shape of icon and color, not by color alone. A photo replaces the icon when there is one.
// Solid ring = exact place, dashed ring = approximate (centre of the town).
function libraryIcon(library: Library, active: boolean) {
  const national = library.type === 'national'
  if (library.image) {
    const frame = national ? 'border-accent' : 'border-ink'
    const halo = active ? 'ring-4 ring-accent' : ''
    const url = library.image.url.replace(/"/g, '%22')
    return L.divIcon({
      className: '',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      html: `<img src="${url}" alt="" class="size-11 rounded-full border-[3px] ${frame} ${halo} bg-plate object-cover shadow-lg" />`,
    })
  }
  const classes = [
    'flex size-8 items-center justify-center rounded-full border-2 border-ink shadow-md transition-transform',
    library.location?.precision === 'exact' ? '' : 'border-dashed',
    TYPE_PIN_CLASSES[library.type],
    active ? 'scale-125 ring-4 ring-accent' : '',
  ].join(' ')
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    html: `<div class="${classes}">${typeIconSvg(library.type, 18)}</div>`,
  })
}

function placeIcon(active: boolean, number: number | undefined) {
  const classes = `flex size-6 items-center justify-center rounded-sm border-2 border-ink bg-gold text-xs font-bold text-on-ink shadow-md ${active ? 'scale-125 ring-4 ring-accent' : ''}`
  return L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div class="${classes}">${number ?? ''}</div>`,
  })
}

function targetOf(
  selection: MapSelection | undefined,
  libraries: Library[],
  places: MapPlace[],
): [number, number] | undefined {
  if (!selection) return undefined
  if (selection.kind === 'library') {
    const location = libraries.find((library) => library.id === selection.id)?.location
    return location ? [location.lat, location.lng] : undefined
  }
  const place = places.find((item) => item.id === selection.id)
  return place ? [place.lat, place.lng] : undefined
}

export default function MapCanvas({ libraries, places, route, selection, onSelect }: MapCanvasProps) {
  const { t } = useI18n()
  const target = targetOf(selection, libraries, places)
  const stopNumbers = new Map(route.map((stop, index) => [stop.id, index + 1]))
  const hasRoute = route.length > 1

  return (
    <div
      className="h-[60vh] overflow-hidden rounded-lg border lg:h-[70vh]"
      role="region"
      aria-label={t('map.canvasLabel')}
    >
      <MapContainer
        bounds={MONTENEGRO_BOUNDS}
        boundsOptions={{ padding: [8, 8] }}
        maxBounds={MAX_BOUNDS}
        maxBoundsViscosity={0.7}
        minZoom={7}
        zoomSnap={0.25}
        scrollWheelZoom={false}
        className="map-calm size-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasRoute && (
          <Polyline
            positions={route.map((stop) => [stop.lat, stop.lng] as [number, number])}
            pathOptions={{ color: MAP_ROUTE_COLOR, weight: 3, dashArray: '6 8' }}
          />
        )}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={placeIcon(
              selection?.kind === 'place' && selection.id === place.id,
              hasRoute ? stopNumbers.get(place.id) : undefined,
            )}
            title={place.title}
            eventHandlers={{ click: () => onSelect({ kind: 'place', id: place.id }) }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              {place.title}
            </Tooltip>
          </Marker>
        ))}
        {libraries.map((library) => {
          if (!library.location) return null
          const active = selection?.kind === 'library' && selection.id === library.id
          return (
            <Marker
              key={library.id}
              position={[library.location.lat, library.location.lng]}
              icon={libraryIcon(library, active)}
              zIndexOffset={active ? 1000 : 0}
              title={library.name}
              eventHandlers={{ click: () => onSelect({ kind: 'library', id: library.id }) }}
            >
              <Tooltip direction="top" offset={[0, library.image ? -22 : -14]}>
                {library.name}
              </Tooltip>
            </Marker>
          )
        })}
        <FlyToSelection target={target} />
        <KeepSize />
        <ResetView />
      </MapContainer>
    </div>
  )
}
