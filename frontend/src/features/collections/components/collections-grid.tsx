import { ExternalLink } from 'lucide-react'

import { Reveal } from '@/components/reveal'
import { SmartImage } from '@/components/smart-image'
import { ErrorNotice } from '@/components/error-notice'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useCollections } from '../api/use-collections'

export function CollectionsGrid() {
  const { t, l } = useI18n()
  const { data, isPending, isError, refetch } = useCollections()

  if (isPending) {
    return (
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        aria-busy="true"
        aria-label={t('common.loading')}
      >
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    )
  }
  if (isError) return <ErrorNotice onRetry={() => refetch()} />
  if (data.length === 0) return <p className="text-muted-foreground">{t('catalog.empty')}</p>

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((collection, index) => (
        <li key={collection.href}>
          <Reveal delay={(index % 4) * 80} className="h-full">
            <a
              href={collection.href}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-ring"
            >
              <div className="aspect-[4/3] overflow-hidden bg-ink">
                <SmartImage
                  src={collection.image}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="text-xl font-semibold">{l(collection.name)}</h2>
                <p className="text-sm text-muted-foreground">{l(collection.text)}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm text-gold">
                  {t('collections.open')}
                  <ExternalLink className="size-4" aria-hidden="true" />
                </span>
              </div>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}
