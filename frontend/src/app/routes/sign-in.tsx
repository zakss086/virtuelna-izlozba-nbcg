import { useNavigate } from 'react-router'

import { homePathFor } from '@/features/auth/home-path'
import { SignInForm } from '@/features/auth/components/sign-in-form'
import { useI18n } from '@/lib/i18n'

export function SignIn() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <section className="mx-auto flex max-w-lg flex-col gap-6 py-8">
      <div>
        <h1 className="text-4xl font-semibold">{t('auth.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('auth.lead')}</p>
      </div>
      <SignInForm onSuccess={(user) => navigate(homePathFor(user.role), { state: { welcome: user.name } })} />
    </section>
  )
}
