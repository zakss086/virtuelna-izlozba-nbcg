import { Ornament } from '@/components/ornament'
import { useCurrentUser } from '@/features/auth/api/use-auth'
import { ProfileCard } from '@/features/auth/components/profile-card'
import { ExhibitionsGrid } from '@/features/exhibitions/components/exhibitions-grid'
import { useFavorites } from '@/features/favorites/api/use-favorites'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { useI18n } from '@/lib/i18n'

export function Profile() {
  const { t } = useI18n()
  const user = useCurrentUser()
  const { ids } = useFavorites()

  if (!user) return null

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-semibold">{t('profile.title')}</h1>
        <Ornament className="mt-4" />
      </div>
      <ProfileCard user={user} />
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">{t('profile.saved')}</h2>
        {ids.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-muted-foreground">{t('fav.empty')}</p>
        ) : (
          <ExhibitionsGrid
            filters={{ status: 'published', ids }}
            renderAction={(e) => <FavoriteButton exhibitionId={e.id} />}
          />
        )}
      </div>
    </section>
  )
}
