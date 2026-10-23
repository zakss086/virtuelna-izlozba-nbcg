import { Ornament } from '@/components/ornament'
import { CollectionsGrid } from '@/features/collections/components/collections-grid'
import { ExhibitionsGrid } from '@/features/exhibitions/components/exhibitions-grid'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useI18n } from '@/lib/i18n'

export function Collections() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-semibold">{t('collections.title')}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t('collections.lead')}</p>
          <Ornament className="mt-4" />
        </div>
        <CollectionsGrid />
      </section>

      <section aria-labelledby="from-collections" className="flex flex-col gap-6">
        <h2 id="from-collections" className="text-3xl font-semibold">
          {t('collections.exhibitions')}
        </h2>
        <ExhibitionsGrid limit={3} renderAction={(e) => <FavoriteButton exhibitionId={e.id} />} />
      </section>
    </div>
  )
}
