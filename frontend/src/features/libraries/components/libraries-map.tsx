import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'

import { useI18n } from '@/lib/i18n'

import type { Library } from '../types'

type LibrariesMapProps = {
  libraries: Library[]
  selectedId: number | undefined
  onSelect: (id: number) => void
}

// South-west and north-east corners that frame the whole country.
const MONTENEGRO_BOUNDS: [[number, number], [number, number]] = [
  [41.8, 18.4],
  [43.6, 20.4],
]

function FlyToSelected({ library }: { library: Library | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (library?.location) map.flyTo([library.location.lat, library.location.lng], 11, { duration: 1 })
  }, [library, map])
  return null
}

// Full ring = exact position, dashed ring = approximate (centre of the town). The national library is gold.
function markerIcon(library: Library, active: boolean) {
  const exact = library.location?.precision === 'exact'
  const national = library.type === 'national'
  const classes = [
    'size-5 rounded-full border-2 border-ink shadow-md',
    exact ? '' : 'border-dashed',
    national || active ? 'bg-accent' : 'bg-plate', // the map tiles stay light in both themes, so pins use theme-independent tokens
    active ? 'scale-150' : '',
  ].join(' ')
  return L.divIcon({ className: '', iconSize: [20, 20], iconAnchor: [10, 10], html: `<div class="${classes}"></div>` })
}

export default function LibrariesMap({ libraries, selectedId, onSelect }: LibrariesMapProps) {
  const { t } = useI18n()
  const selected = libraries.find((library) => library.id === selectedId)

  return (
    <div className="h-[55vh] overflow-hidden rounded-lg border lg:h-[70vh]" role="region" aria-label={t('libraries.mapLabel')}>
      <MapContainer bounds={MONTENEGRO_BOUNDS} scrollWheelZoom={false} className="size-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {libraries.map((library) =>
          library.location ? (
            <Marker
              key={library.id}
              position={[library.location.lat, library.location.lng]}
              icon={markerIcon(library, library.id === selectedId)}
              title={library.name}
              eventHandlers={{ click: () => onSelect(library.id) }}
            />
          ) : null,
        )}
        <FlyToSelected library={selected} />
      </MapContainer>
    </div>
  )
}
