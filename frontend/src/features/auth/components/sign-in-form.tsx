import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/http'
import { useI18n } from '@/lib/i18n'

import { authApi, DEMO_PASSWORD } from '../api/auth-api'
import { useSignIn } from '../api/use-auth'
import type { User } from '../types'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type FormValues = z.infer<typeof schema>

type SignInFormProps = { onSuccess: (user: User) => void }

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { t } = useI18n()
  const signIn = useSignIn()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit((values) => signIn.mutate(values, { onSuccess: (user) => onSuccess(user) }))}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </div>
        {signIn.isError && (
          <p role="alert" className="text-sm text-destructive">
            {signIn.error instanceof ApiError && signIn.error.code === 'account_disabled'
              ? t('auth.disabled')
              : t('auth.invalid')}
          </p>
        )}
        <Button type="submit" disabled={signIn.isPending}>
          {t('auth.submit')}
        </Button>
      </form>

      <section aria-labelledby="demo-heading" className="rounded-lg border bg-secondary p-4">
        <h2 id="demo-heading" className="text-lg font-semibold">
          {t('auth.demo')}
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {authApi.demoUsers.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => {
                  setValue('email', user.email)
                  setValue('password', DEMO_PASSWORD)
                }}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-background focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span>
                  {user.name} <span className="text-muted-foreground">· {user.email}</span>
                </span>
                <span className="text-xs uppercase tracking-widest text-gold">{t(`role.${user.role}`)}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{t('auth.demoHint')}</p>
      </section>
    </div>
  )
}
