import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'

import { useI18n } from '@/lib/i18n'

type LocationPickerProps = {
  /** The coordinates typed in the form; empty or invalid means no pin yet. */
  lat: string
  lng: string
  onPick: (lat: number, lng: number) => void
}

// Frames the whole country; the picked pin takes over once there is one.
const MONTENEGRO_BOUNDS: [[number, number], [number, number]] = [
  [41.8, 18.4],
  [43.6, 20.4],
]

// The map tiles stay light in both themes, so the pin uses theme-independent tokens.
const pinIcon = L.divIcon({
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: '<div class="size-6 rounded-full border-[3px] border-ink bg-accent shadow-lg ring-4 ring-plate"></div>',
})

function toPosition(lat: string, lng: string): [number, number] | undefined {
  if (lat.trim() === '' || lng.trim() === '') return undefined
  const a = Number(lat)
  const b = Number(lng)
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180
    ? [a, b]
    : undefined
}

function ClickToPick({ onPick }: { onPick: LocationPickerProps['onPick'] }) {
  useMapEvents({ click: (event) => onPick(event.latlng.lat, event.latlng.lng) })
  return null
}

// Brings the map to the pin when it is typed or picked, without zooming out again.
function FollowPin({ position }: { position: [number, number] | undefined }) {
  const map = useMap()
  const [lat, lng] = position ?? []
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) map.setView([lat, lng], Math.max(map.getZoom(), 12))
  }, [lat, lng, map])
  return null
}

// A small map for placing a library: click where it is, or type the coordinates and the pin follows.
export default function LocationPicker({ lat, lng, onPick }: LocationPickerProps) {
  const { t } = useI18n()
  const position = toPosition(lat, lng)

  return (
    <div className="h-72 overflow-hidden rounded-lg border" role="region" aria-label={t('adm.pickOnMap')}>
      <MapContainer bounds={MONTENEGRO_BOUNDS} scrollWheelZoom={false} className="map-calm size-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPick onPick={onPick} />
        <FollowPin position={position} />
        {position && <Marker position={position} icon={pinIcon} interactive={false} />}
      </MapContainer>
    </div>
  )
}
