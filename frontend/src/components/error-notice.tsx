import { CircleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

type ErrorNoticeProps = {
  /** Message key; defaults to the generic "data unavailable" text. */
  messageKey?: 'common.error' | 'catalog.error'
  onRetry?: () => void
}

// Shown when a list or page could not be loaded, with a way to try again.
export function ErrorNotice({ messageKey = 'common.error', onRetry }: ErrorNoticeProps) {
  const { t } = useI18n()

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 p-6"
    >
      <p className="flex items-start gap-2">
        <CircleAlert className="mt-1 size-4 shrink-0 text-destructive" aria-hidden="true" />
        {t(messageKey)}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}
