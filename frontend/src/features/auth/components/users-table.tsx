import { ErrorNotice } from '@/components/error-notice'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useUsers } from '../api/use-auth'

export function UsersTable() {
  const { t } = useI18n()
  const { data, isPending, isError, refetch } = useUsers()

  if (isPending) return <Skeleton className="h-32 w-full" aria-busy="true" aria-label={t('common.loading')} />
  if (isError) return <ErrorNotice onRetry={() => refetch()} />

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>
            <th scope="col" className="p-3 font-medium">
              {t('admin.name')}
            </th>
            <th scope="col" className="p-3 font-medium">
              {t('auth.email')}
            </th>
            <th scope="col" className="p-3 font-medium">
              {t('admin.role')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((user) => (
            <tr key={user.id}>
              <td className="p-3">{user.name}</td>
              <td className="p-3 text-muted-foreground">{user.email}</td>
              <td className="p-3">{t(`role.${user.role}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
