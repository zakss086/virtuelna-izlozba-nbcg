import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useExhibitions, useSetExhibitionStatus } from '../api/use-exhibitions'

export function ReviewQueue() {
  const { t, l } = useI18n()
  const { data, isPending, isError } = useExhibitions({ status: 'pending' })
  const setStatus = useSetExhibitionStatus()

  if (isPending) return <Skeleton className="h-24 w-full" aria-busy="true" />
  if (isError) return <p role="alert">{t('common.error')}</p>
  if (data.length === 0)
    return (
      <p className="rounded-lg border border-dashed p-6 text-muted-foreground">{t('admin.queueEmpty')}</p>
    )

  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {data.map((exhibition) => (
        <li
          key={exhibition.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <Link to={`/exhibitions/${exhibition.slug}`} className="font-medium hover:underline">
              {l(exhibition.title)}
            </Link>
            <p className="text-sm text-muted-foreground">
              {exhibition.authorName} · {t(`tpl.${exhibition.template}`)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setStatus.mutate({ id: exhibition.id, status: 'published' })}>
              {t('admin.approve')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStatus.mutate({ id: exhibition.id, status: 'draft' })}
            >
              {t('admin.reject')}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
