import { WifiOff } from 'lucide-react'
import { useSyncExternalStore } from 'react'

import { useI18n } from '@/lib/i18n'

function subscribe(listener: () => void) {
  window.addEventListener('online', listener)
  window.addEventListener('offline', listener)
  return () => {
    window.removeEventListener('online', listener)
    window.removeEventListener('offline', listener)
  }
}

// Warns visitors when the connection drops, because images, maps and videos come from the network.
export function OfflineBanner() {
  const { t } = useI18n()
  const online = useSyncExternalStore(subscribe, () => navigator.onLine)

  if (online) return null

  return (
    <div role="status" className="border-b border-destructive/40 bg-secondary">
      <p className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-sm">
        <WifiOff className="size-4 shrink-0" aria-hidden="true" />
        {t('notice.offline')}
      </p>
    </div>
  )
}
