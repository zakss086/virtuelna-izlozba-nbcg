import { FileText, Landmark, LibraryBig } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { UserCreateForm } from '@/features/auth/components/user-create-form'
import { UsersTable } from '@/features/auth/components/users-table'
import { ReviewQueue } from '@/features/exhibitions/components/review-queue'
import { useI18n } from '@/lib/i18n'

export function Admin() {
  const { t } = useI18n()

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-4xl font-semibold">{t('admin.title')}</h1>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">{t('admin.queue')}</h2>
        <ReviewQueue />
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">{t('cms.title')}</h2>
        <p className="max-w-prose text-muted-foreground">
          {t('cms.linkDesc')} {t('adm.linkDesc')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/content">
              <FileText />
              {t('cms.link')}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/libraries">
              <Landmark />
              {t('adm.libraries.title')}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/collections">
              <LibraryBig />
              {t('adm.collections.title')}
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">{t('admin.users')}</h2>
        <UsersTable />
        <UserCreateForm />
      </div>
    </section>
  )
}
