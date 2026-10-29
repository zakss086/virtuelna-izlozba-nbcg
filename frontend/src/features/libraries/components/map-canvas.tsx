import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'

import { useI18n } from '@/lib/i18n'
import type { MapPlace } from '@/lib/map-place'

import type { Library, MapSelection } from '../types'

type MapCanvasProps = {
  libraries: Library[]
  places: MapPlace[]
  selection: MapSelection | undefined
  onSelect: (selection: MapSelection) => void
}

// South-west and north-east corners that frame the whole country.
const MONTENEGRO_BOUNDS: [[number, number], [number, number]] = [
  [41.8, 18.4],
  [43.6, 20.4],
]

function FlyToSelection({ target }: { target: [number, number] | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 11, { duration: 1 })
  }, [target, map])
  return null
}

// The map tiles stay light in both themes, so pins use theme-independent tokens.
// Libraries with a photo show it in a round frame; the others are rings (solid = exact, dashed = approximate).
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
    'size-5 rounded-full border-2 border-ink shadow-md',
    library.location?.precision === 'exact' ? '' : 'border-dashed',
    national || active ? 'bg-accent' : 'bg-plate',
    active ? 'scale-150' : '',
  ].join(' ')
  return L.divIcon({ className: '', iconSize: [20, 20], iconAnchor: [10, 10], html: `<div class="${classes}"></div>` })
}

function placeIcon(active: boolean) {
  return L.divIcon({
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<div class="size-4 rotate-45 rounded-sm border-2 border-ink bg-gold shadow-md ${active ? 'scale-150' : ''}"></div>`,
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

export default function MapCanvas({ libraries, places, selection, onSelect }: MapCanvasProps) {
  const { t } = useI18n()
  const target = targetOf(selection, libraries, places)

  return (
    <div
      className="h-[55vh] overflow-hidden rounded-lg border lg:h-[70vh]"
      role="region"
      aria-label={t('map.canvasLabel')}
    >
      <MapContainer bounds={MONTENEGRO_BOUNDS} scrollWheelZoom={false} className="size-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={placeIcon(selection?.kind === 'place' && selection.id === place.id)}
            title={place.title}
            eventHandlers={{ click: () => onSelect({ kind: 'place', id: place.id }) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
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
              <Tooltip direction="top" offset={[0, library.image ? -22 : -10]}>
                {library.name}
              </Tooltip>
            </Marker>
          )
        })}
        <FlyToSelection target={target} />
      </MapContainer>
    </div>
  )
}
