import { Mail, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n'

import type { User } from '../types'

type ProfileCardProps = { user: User }

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')

export function ProfileCard({ user }: ProfileCardProps) {
  const { t } = useI18n()

  return (
    <section
      aria-labelledby="profile-name"
      className="flex flex-col gap-6 rounded-lg border bg-card p-6 text-card-foreground sm:flex-row sm:items-center"
    >
      <span
        aria-hidden="true"
        className="flex size-16 shrink-0 items-center justify-center rounded-full bg-ink font-heading text-2xl font-semibold text-accent"
      >
        {initials(user.name)}
      </span>
      <div className="flex flex-col gap-2">
        <h2 id="profile-name" className="text-2xl font-semibold">
          {user.name}
        </h2>
        <p className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Mail className="size-4" aria-hidden="true" />
            {user.email}
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4" aria-hidden="true" />
            <Badge variant="accent">{t(`role.${user.role}`)}</Badge>
          </span>
        </p>
        <p className="max-w-prose text-muted-foreground">{t(`profile.desc.${user.role}`)}</p>
      </div>
    </section>
  )
}
