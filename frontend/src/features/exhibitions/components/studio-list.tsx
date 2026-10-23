import { Pencil, Send, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useExhibitions, useRemoveExhibition, useSetExhibitionStatus } from '../api/use-exhibitions'

type StudioListProps = { authorId: number }

export function StudioList({ authorId }: StudioListProps) {
  const { t, l } = useI18n()
  const { data, isPending, isError } = useExhibitions({ authorId })
  const remove = useRemoveExhibition()
  const setStatus = useSetExhibitionStatus()

  if (isPending) return <Skeleton className="h-40 w-full" aria-busy="true" />
  if (isError) return <p role="alert">{t('common.error')}</p>
  if (data.length === 0)
    return <p className="rounded-lg border border-dashed p-8 text-muted-foreground">{t('studio.empty')}</p>

  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {data.map((exhibition) => (
        <li
          key={exhibition.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-4">
            <img
              src={exhibition.coverUrl}
              alt=""
              className="hidden h-14 w-24 rounded object-cover sm:block"
            />
            <div className="min-w-0">
              <Link
                to={`/exhibitions/${exhibition.slug}`}
                className="block truncate font-medium hover:underline"
              >
                {l(exhibition.title)}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={exhibition.status === 'published' ? 'accent' : 'secondary'}>
                  {t(`status.${exhibition.status}`)}
                </Badge>
                <span className="text-xs text-muted-foreground">{t(`tpl.${exhibition.template}`)}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {exhibition.status === 'draft' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatus.mutate({ id: exhibition.id, status: 'pending' })}
              >
                <Send />
                {t('studio.submit')}
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link to={`/studio/${exhibition.id}/edit`}>
                <Pencil />
                {t('studio.edit')}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => {
                if (window.confirm(t('studio.confirmDelete'))) remove.mutate(exhibition.id)
              }}
            >
              <Trash2 />
              <span className="sr-only">{t('studio.delete')}</span>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
