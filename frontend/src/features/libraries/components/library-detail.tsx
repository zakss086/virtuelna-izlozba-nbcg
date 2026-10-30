import { Copy, ExternalLink, Landmark, Mail, MapPinned, Navigation, Phone, X } from 'lucide-react'

import { SmartImage } from '@/components/smart-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { showToast } from '@/lib/toast'

import type { Library } from '../types'

type LibraryDetailProps = {
  library: Library
  distanceKm?: number
  onClose: () => void
}

// Larger card for the selected library: photo with credit, facts, contact and links.
export function LibraryDetail({ library, distanceKm, onClose }: LibraryDetailProps) {
  const { t, l } = useI18n()
  const { location, image } = library
  const osmUrl = location
    ? `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=16/${location.lat}/${location.lng}`
    : undefined
  const directionsUrl = location
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
    : undefined

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/map?library=${library.id}`)
      showToast('success', t('map.linkCopied'))
    } catch {
      showToast('error', t('viewer.citeCopy'))
    }
  }

  return (
    <article className="overflow-hidden rounded-lg border border-accent bg-card" aria-label={library.name}>
      {image ? (
        <SmartImage src={image.url} alt={library.name} className="aspect-[16/9] w-full object-cover" />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted text-muted-foreground">
          <Landmark className="size-12" aria-hidden="true" />
        </div>
      )}
      {image && (
        <p className="px-4 pt-2 text-xs text-muted-foreground">
          {t('map.photoCredit', { author: image.credit, license: image.license })}{' '}
          <a className="text-gold underline" href={image.sourceUrl} target="_blank" rel="noreferrer">
            Wikimedia Commons
          </a>
        </p>
      )}

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant={library.type === 'national' ? 'accent' : 'secondary'}>
              {t(`libraries.type.${library.type}`)}
            </Badge>
            <h2 className="mt-2 text-xl font-semibold">{library.name}</h2>
            <p className="text-sm text-muted-foreground">
              {library.address ? `${library.city}, ${library.address}` : library.city}
              {distanceKm !== undefined && (
                <span className="ml-2 whitespace-nowrap text-gold">
                  · {t('map.distance', { km: Math.max(1, Math.round(distanceKm)) })}
                </span>
              )}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label={t('viewer.close')} onClick={onClose}>
            <X />
          </Button>
        </div>

        {library.description && <p className="text-sm">{l(library.description)}</p>}

        <ul className="flex flex-col gap-1 text-sm">
          {library.phone && (
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-gold" aria-hidden="true" />
              {library.phone}
            </li>
          )}
          {library.email && (
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-gold" aria-hidden="true" />
              {library.email}
            </li>
          )}
        </ul>

        {location?.precision === 'town' && (
          <p className="text-xs text-muted-foreground">{t('libraries.approx')}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {directionsUrl && (
            <Button asChild size="sm">
              <a href={directionsUrl} target="_blank" rel="noreferrer">
                <Navigation />
                {t('map.directions')}
              </a>
            </Button>
          )}
          {library.website && (
            <Button asChild variant="outline" size="sm">
              <a href={library.website} target="_blank" rel="noreferrer">
                <ExternalLink />
                {t('libraries.website')}
              </a>
            </Button>
          )}
          {osmUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={osmUrl} target="_blank" rel="noreferrer">
                <MapPinned />
                {t('map.openInOsm')}
              </a>
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={copyLink}>
            <Copy />
            {t('map.copyLink')}
          </Button>
        </div>
      </div>
    </article>
  )
}
