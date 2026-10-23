import { ExhibitionsExplorer } from '@/features/exhibitions/components/exhibitions-explorer'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useI18n } from '@/lib/i18n'

export function Exhibitions() {
  const { t } = useI18n()

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-4xl font-semibold">{t('catalog.title')}</h1>
      <ExhibitionsExplorer renderAction={(e) => <FavoriteButton exhibitionId={e.id} />} />
    </section>
  )
}
