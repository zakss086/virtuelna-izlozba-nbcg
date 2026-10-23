import { Plus } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/features/auth/api/use-auth'
import { StudioList } from '@/features/exhibitions/components/studio-list'
import { useI18n } from '@/lib/i18n'

export function Studio() {
  const { t } = useI18n()
  const user = useCurrentUser()

  if (!user) return null

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold">{t('studio.title')}</h1>
        <Button asChild>
          <Link to="/studio/new">
            <Plus />
            {t('studio.new')}
          </Link>
        </Button>
      </div>
      <StudioList authorId={user.id} />
    </section>
  )
}
