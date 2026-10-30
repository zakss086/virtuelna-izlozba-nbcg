import { Plus } from 'lucide-react'
import { Link } from 'react-router'

import { Ornament } from '@/components/ornament'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/features/auth/api/use-auth'
import { useExhibitionPlaces } from '@/features/exhibitions/api/use-exhibition-places'
import { MapExplorer } from '@/features/libraries/components/map-explorer'
import { useI18n } from '@/lib/i18n'

export function MapPage() {
  const { t } = useI18n()
  const places = useExhibitionPlaces()
  const isAdmin = useCurrentUser()?.role === 'admin'

  return (
    <section className="flex flex-col gap-8">
      <div>
        {isAdmin && (
          <Button asChild variant="outline" size="sm" className="float-right ml-4">
            <Link to="/admin/libraries/new">
              <Plus />
              {t('adm.libraries.add')}
            </Link>
          </Button>
        )}
        <h1 className="text-4xl font-semibold">{t('map.title')}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t('map.lead')}</p>
        <Ornament className="mt-4" />
      </div>
      <MapExplorer
        places={places}
        renderLibraryActions={(library) =>
          isAdmin ? (
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link to={`/admin/libraries/${library.id}`}>{t('adm.edit')}</Link>
            </Button>
          ) : null
        }
      />
      <aside className="max-w-3xl rounded-lg border bg-secondary p-4 text-sm">
        <h2 className="font-heading text-lg font-semibold">{t('libraries.sources.title')}</h2>
        <p className="mt-1 text-muted-foreground">{t('libraries.sources.body')}</p>
        <p className="mt-2 flex flex-wrap gap-4">
          <a
            className="text-gold underline"
            href="https://cg.cobiss.net/pokazatelji"
            target="_blank"
            rel="noreferrer"
          >
            COBISS.CG
          </a>
          <a
            className="text-gold underline"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap
          </a>
          <a
            className="text-gold underline"
            href="https://commons.wikimedia.org"
            target="_blank"
            rel="noreferrer"
          >
            Wikimedia Commons
          </a>
        </p>
      </aside>
    </section>
  )
}
