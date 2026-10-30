import { useState } from 'react'

import { ErrorNotice } from '@/components/error-notice'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useAuditHistory } from '../api/use-audit'
import { AUDIT_ENTITY_TYPES, type AuditEntityType } from '../types'
import { describeDetail } from './describe-detail'

const ALL = 'all'

export function HistoryList() {
  const { t, lang } = useI18n()
  const [type, setType] = useState<AuditEntityType | typeof ALL>(ALL)
  const [page, setPage] = useState(1)
  const { data, isPending, isError, isPlaceholderData, refetch } = useAuditHistory(
    type === ALL ? undefined : type,
    page,
  )

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(lang === 'me' ? 'sr-Latn-ME' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="audit-type">{t('audit.filter')}</Label>
        <Select
          value={type}
          onValueChange={(value) => {
            setType(AUDIT_ENTITY_TYPES.find((o) => o === value) ?? ALL)
            setPage(1)
          }}
        >
          <SelectTrigger id="audit-type" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('audit.filter.all')}</SelectItem>
            {AUDIT_ENTITY_TYPES.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`audit.type.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending && <Skeleton className="h-48 w-full" aria-busy="true" aria-label={t('common.loading')} />}
      {isError && <ErrorNotice onRetry={() => refetch()} />}
      {data && data.items.length === 0 && <p className="text-muted-foreground">{t('audit.empty')}</p>}

      {data && data.items.length > 0 && (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th scope="col" className="p-3 font-medium">
                    {t('audit.col.time')}
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    {t('audit.col.who')}
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    {t('audit.col.action')}
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    {t('audit.col.what')}
                  </th>
                  <th scope="col" className="p-3 font-medium">
                    {t('audit.col.detail')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y align-top">
                {data.items.map((entry) => (
                  <tr key={entry.id}>
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {formatTime(entry.createdAt)}
                    </td>
                    <td className="p-3">{entry.actorName}</td>
                    <td className="p-3 whitespace-nowrap">{t(`audit.action.${entry.action}`)}</td>
                    <td className="p-3">
                      <span className="text-xs uppercase tracking-widest text-gold">
                        {t(`audit.type.${entry.entityType}`)}
                      </span>
                      <br />
                      {entry.label}
                    </td>
                    <td className="p-3 text-muted-foreground">{describeDetail(entry.detail, t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              {t('audit.prev')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t('audit.pageOf', { page, pages: data.pages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('audit.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
