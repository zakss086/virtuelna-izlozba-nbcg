import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

const VISIBLE_MS = 6000

// Shows a short greeting after sign-in. The sign-in page passes the name as router state ({ welcome }).
export function WelcomeBanner() {
  const { t } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()
  const state: unknown = location.state
  const name =
    typeof state === 'object' && state !== null && 'welcome' in state && typeof state.welcome === 'string'
      ? state.welcome
      : null

  useEffect(() => {
    if (!name) return
    const timer = window.setTimeout(
      () => navigate(location.pathname, { replace: true, state: null }),
      VISIBLE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [name, location.pathname, location.key, navigate])

  if (!name) return null

  return (
    <div role="status" className="border-b border-accent/40 bg-secondary">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-sm">
        <p className="font-medium">{t('auth.welcome', { name })}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={t('viewer.close')}
          onClick={() => navigate(location.pathname, { replace: true, state: null })}
        >
          <X />
        </Button>
      </div>
    </div>
  )
}
