import { useState } from 'react'

import { ErrorNotice } from '@/components/error-notice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useCurrentUser, useUpdateUser, useUsers } from '../api/use-auth'
import type { Role, User } from '../types'

function PasswordCell({ user }: { user: User }) {
  const { t } = useI18n()
  const update = useUpdateUser()
  const [password, setPassword] = useState('')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        update.mutate({ id: user.id, changes: { password } }, { onSuccess: () => setPassword('') })
      }}
      className="flex items-center gap-2"
    >
      <Input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('admin.newPassword')}
        aria-label={`${t('admin.newPassword')}: ${user.name}`}
        autoComplete="off"
        className="h-9 min-w-36"
      />
      <Button type="submit" size="sm" variant="outline" disabled={password.length < 8 || update.isPending}>
        {t('admin.setPassword')}
      </Button>
      {update.isSuccess && password === '' && (
        <span role="status" className="text-xs text-muted-foreground">
          {t('admin.passwordSaved')}
        </span>
      )}
    </form>
  )
}

export function UsersTable() {
  const { t } = useI18n()
  const { data, isPending, isError, refetch } = useUsers()
  const update = useUpdateUser()
  const current = useCurrentUser()

  if (isPending) return <Skeleton className="h-32 w-full" aria-busy="true" aria-label={t('common.loading')} />
  if (isError) return <ErrorNotice onRetry={() => refetch()} />

  return (
    <div className="flex flex-col gap-2">
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
              <th scope="col" className="p-3 font-medium">
                {t('admin.status')}
              </th>
              <th scope="col" className="p-3 font-medium">
                {t('admin.newPassword')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((user) => {
              const own = user.id === current?.id
              return (
                <tr key={user.id} className={user.isActive ? undefined : 'text-muted-foreground'}>
                  <td className="p-3">{user.name}</td>
                  <td className="p-3 text-muted-foreground">{user.email}</td>
                  <td className="p-3">
                    <Select
                      value={user.role}
                      disabled={own || update.isPending}
                      onValueChange={(role) => update.mutate({ id: user.id, changes: { role: role as Role } })}
                    >
                      <SelectTrigger className="h-9 w-40" aria-label={`${t('admin.role')}: ${user.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="curator">{t('role.curator')}</SelectItem>
                        <SelectItem value="admin">{t('role.admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span>{user.isActive ? t('admin.active') : t('admin.inactive')}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={own || update.isPending}
                        onClick={() => update.mutate({ id: user.id, changes: { isActive: !user.isActive } })}
                      >
                        {user.isActive ? t('admin.switchOff') : t('admin.switchOn')}
                      </Button>
                    </div>
                  </td>
                  <td className="p-3">
                    <PasswordCell user={user} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{t('admin.ownRow')}</p>
      {update.isError && (
        <p role="alert" className="text-sm text-destructive">
          {t('common.error')}
        </p>
      )}
    </div>
  )
}
