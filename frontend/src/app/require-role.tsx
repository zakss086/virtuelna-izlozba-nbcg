import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { useCurrentUser } from '@/features/auth/api/use-auth'
import type { Role } from '@/features/auth/types'
import { useI18n } from '@/lib/i18n'

type RequireRoleProps = { roles: Role[]; children: ReactNode }

// Route guard: redirects anonymous visitors to sign-in and blocks users without the right role.
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { t } = useI18n()
  const user = useCurrentUser()

  if (!user) return <Navigate to="/sign-in" replace />
  if (!roles.includes(user.role))
    return (
      <p role="alert" className="py-12 text-lg">
        {t('auth.forbidden')}
      </p>
    )
  return children
}
