import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useExhibitions } from '../api/use-exhibitions'
import type { Exhibition, ExhibitionFilters } from '../types'
import { ExhibitionCard } from './exhibition-card'

type ExhibitionsGridProps = {
  filters?: ExhibitionFilters
  limit?: number
  renderAction?: (exhibition: Exhibition) => ReactNode
  onReset?: () => void
}

export function ExhibitionsGrid({
  filters = { status: 'published' },
  limit,
  renderAction,
  onReset,
}: ExhibitionsGridProps) {
  const { t } = useI18n()
  const { data, isPending, isError, refetch } = useExhibitions(filters)

  if (isPending) {
    return (
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-label={t('common.loading')}
      >
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 p-6"
      >
        <p>{t('catalog.error')}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t('catalog.retry')}
        </Button>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-8">
        <p className="text-muted-foreground">{t('catalog.empty')}</p>
        {onReset && (
          <Button variant="outline" onClick={onReset}>
            {t('catalog.reset')}
          </Button>
        )}
      </div>
    )
  }

  const shown = limit ? data.slice(0, limit) : data
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((exhibition) => (
        <ExhibitionCard key={exhibition.id} exhibition={exhibition} action={renderAction?.(exhibition)} />
      ))}
    </div>
  )
}
