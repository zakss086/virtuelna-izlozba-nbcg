import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ApiError } from '@/lib/http'
import { useI18n } from '@/lib/i18n'

import { useCreateUser } from '../api/use-auth'
import type { Role } from '../types'

// Plain state instead of a form library: four fields and the server decides what is valid.
export function UserCreateForm() {
  const { t } = useI18n()
  const create = useCreateUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('curator')
  const [password, setPassword] = useState('')

  const submit = () =>
    create.mutate(
      { name: name.trim(), email: email.trim(), role, password },
      {
        onSuccess: () => {
          setName('')
          setEmail('')
          setPassword('')
          setRole('curator')
        },
      },
    )

  const conflict = create.error instanceof ApiError && create.error.code === 'email_already_registered'
  const invalid = create.error instanceof ApiError && create.error.code === 'validation_error'
  const errorKey = conflict ? 'admin.err.email_already_registered' : invalid ? 'admin.err.validation_error' : 'common.error'

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="flex flex-col gap-4 rounded-lg border p-4"
      noValidate
    >
      <div>
        <h3 className="text-lg font-semibold">{t('admin.addUser')}</h3>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">{t('admin.addUserDesc')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-user-name">{t('admin.name')}</Label>
          <Input id="new-user-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-user-email">{t('auth.email')}</Label>
          <Input
            id="new-user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-user-role">{t('admin.role')}</Label>
          <Select value={role} onValueChange={(value) => setRole(value as Role)}>
            <SelectTrigger id="new-user-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="curator">{t('role.curator')}</SelectItem>
              <SelectItem value="admin">{t('role.admin')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-user-password">{t('admin.firstPassword')}</Label>
          <Input
            id="new-user-password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
      {create.isError && (
        <p role="alert" className="text-sm text-destructive">
          {t(errorKey)}
        </p>
      )}
      {create.isSuccess && (
        <p role="status" className="text-sm text-muted-foreground">
          {t('admin.created')}
        </p>
      )}
      <div>
        <Button type="submit" disabled={create.isPending}>
          {t('admin.create')}
        </Button>
      </div>
    </form>
  )
}
