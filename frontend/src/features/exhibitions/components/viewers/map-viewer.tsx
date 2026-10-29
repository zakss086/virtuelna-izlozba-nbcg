import { SmartImage } from '@/components/smart-image'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'

import { useI18n } from '@/lib/i18n'
import { MAP_ROUTE_COLOR } from '@/lib/scene-palette'
import { cn } from '@/lib/utils'

import type { Exhibition } from '../../types'

type MapViewerProps = { exhibition: Exhibition }

function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, 10, { duration: 1.2 })
  }, [center, map])
  return null
}

function markerIcon(label: number, active: boolean) {
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    html: `<div class="flex size-8 items-center justify-center rounded-full border-2 border-ink text-sm font-bold shadow-lg ${
      active ? 'bg-accent text-accent-foreground scale-125' : 'bg-card text-card-foreground'
    }">${label}</div>`,
  })
}

export default function MapViewer({ exhibition }: MapViewerProps) {
  const { t, l } = useI18n()
  const stops = exhibition.sections.filter((s) => s.place)
  const [active, setActive] = useState(0)
  const first = stops[0]?.place
  const current = stops[active]?.place
  const path: [number, number][] = stops.flatMap((s) =>
    s.place ? [[s.place.lat, s.place.lng] as [number, number]] : [],
  )

  if (!first || !current) return null

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
      <ol className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-2 lg:order-1">
        {stops.map((section, index) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-current={index === active}
              className={cn(
                'w-full rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                index === active ? 'border-accent bg-secondary' : 'hover:bg-muted',
              )}
            >
              <span className="text-xs uppercase tracking-widest text-gold">
                {index + 1} · {section.place ? l(section.place.name) : ''}
                {section.year ? ` · ${section.year}` : ''}
              </span>
              <h2 className="mt-1 text-xl font-semibold">{l(section.title)}</h2>
              {index === active && (
                <>
                  <p className="mt-2 text-sm text-muted-foreground">{l(section.text)}</p>
                  {section.items[0] && (
                    <SmartImage
                      src={section.items[0].imageUrl}
                      alt={l(section.items[0].title)}
                      className="mt-3 aspect-[16/9] w-full rounded object-cover"
                    />
                  )}
                </>
              )}
            </button>
          </li>
        ))}
      </ol>

      <div className="h-[50vh] overflow-hidden rounded-lg border lg:h-[70vh]" aria-label={t('tpl.map')}>
        <MapContainer center={[first.lat, first.lng]} zoom={9} scrollWheelZoom={false} className="size-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={path} pathOptions={{ color: MAP_ROUTE_COLOR, weight: 3, dashArray: '6 8' }} />
          {stops.map((section, index) =>
            section.place ? (
              <Marker
                key={section.id}
                position={[section.place.lat, section.place.lng]}
                icon={markerIcon(index + 1, index === active)}
                eventHandlers={{ click: () => setActive(index) }}
              >
                <Popup>
                  <p className="font-semibold">{l(section.title)}</p>
                  {section.items[0] && (
                    <img
                      src={section.items[0].imageUrl}
                      alt={l(section.items[0].title)}
                      className="mt-2 aspect-[16/10] w-48 rounded object-cover"
                    />
                  )}
                </Popup>
              </Marker>
            ) : null,
          )}
          <FlyTo center={[current.lat, current.lng]} />
        </MapContainer>
      </div>
    </div>
  )
}
