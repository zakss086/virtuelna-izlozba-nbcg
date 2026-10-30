import type { MessageKey } from '@/lib/messages'

type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string

const STATUSES = ['draft', 'pending', 'published'] as const
const ROLES = ['curator', 'admin'] as const

function pick<T extends string>(options: readonly T[], value: string): T | undefined {
  return options.find((option) => option === value)
}

function status(value: string, t: Translate) {
  const known = pick(STATUSES, value)
  return known ? t(`status.${known}`) : value
}

function role(value: string, t: Translate) {
  const known = pick(ROLES, value)
  return known ? t(`role.${known}`) : value
}

function describeCode(code: string, t: Translate): string {
  const [key, value = ''] = code.split('=')
  const [from = '', to = ''] = value.split('>')
  if (key === 'status') {
    return to
      ? t('audit.d.statusMove', { from: status(from, t), to: status(to, t) })
      : t('audit.d.status', { status: status(from, t) })
  }
  if (key === 'role') {
    return to
      ? t('audit.d.roleMove', { from: role(from, t), to: role(to, t) })
      : t('audit.d.role', { role: role(from, t) })
  }
  if (key === 'type') return t('audit.d.type', { type: value })
  if (key === 'size')
    return t('audit.d.size', { size: `${Math.max(1, Math.round(Number(value) / 1024))} kB` })
  if (code === 'switched_on') return t('audit.d.on')
  if (code === 'switched_off') return t('audit.d.off')
  if (code === 'new_password') return t('audit.d.password')
  if (code === 'default_restored') return t('audit.d.restored')
  return t('audit.d.field', { name: code })
}

// The backend stores short codes, not sentences, so the same entry reads right in both languages.
export function describeDetail(detail: string | undefined, t: Translate): string {
  if (!detail) return ''
  return detail
    .split(', ')
    .map((code) => describeCode(code, t))
    .join('; ')
}
