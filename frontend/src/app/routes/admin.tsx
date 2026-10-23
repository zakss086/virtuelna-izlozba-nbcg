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
        <h2 className="text-2xl font-semibold">{t('admin.users')}</h2>
        <UsersTable />
      </div>
    </section>
  )
}
