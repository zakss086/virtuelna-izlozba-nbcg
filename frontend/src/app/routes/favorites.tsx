import { ExhibitionsGrid } from '@/features/exhibitions/components/exhibitions-grid'
import { useFavorites } from '@/features/favorites/api/use-favorites'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useI18n } from '@/lib/i18n'

export function Favorites() {
  const { t } = useI18n()
  const { ids } = useFavorites()

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-4xl font-semibold">{t('fav.title')}</h1>
      {ids.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8">
          <p className="text-lg">{t('fav.empty')}</p>
          <p className="mt-1 text-muted-foreground">{t('fav.emptyHint')}</p>
        </div>
      ) : (
        <ExhibitionsGrid
          filters={{ status: 'published', ids }}
          renderAction={(e) => <FavoriteButton exhibitionId={e.id} />}
        />
      )}
    </section>
  )
}
