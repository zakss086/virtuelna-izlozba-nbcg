import { FileText } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
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
        <p className="max-w-prose text-muted-foreground">{t('cms.linkDesc')}</p>
        <Button asChild variant="outline" className="w-fit">
          <Link to="/admin/content">
            <FileText />
            {t('cms.link')}
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">{t('admin.users')}</h2>
        <UsersTable />
      </div>
    </section>
  )
}
