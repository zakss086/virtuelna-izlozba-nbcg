import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { I18nProvider } from '@/lib/i18n'

const queryClient = new QueryClient()

type ProvidersProps = {
  children: ReactNode
}

// All global providers in one place (data cache, language).
export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </I18nProvider>
  )
}
