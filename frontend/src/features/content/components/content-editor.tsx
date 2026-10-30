import { ErrorNotice } from '@/components/error-notice'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useContentBlocks } from '../api/use-content'
import { CONTENT_GROUPS, EDITABLE_CONTENT } from '../editable-keys'
import { ContentField } from './content-field'

// Every editable site text, grouped by where it appears.
export function ContentEditor() {
  const { t } = useI18n()
  const { data, isPending, isError, refetch } = useContentBlocks()

  if (isPending) return <Skeleton className="h-64 w-full" aria-busy="true" aria-label={t('common.loading')} />
  if (isError) return <ErrorNotice onRetry={() => refetch()} />

  return (
    <div className="flex flex-col gap-12">
      {CONTENT_GROUPS.map((group) => (
        <section key={group} aria-labelledby={`cms-${group}`} className="flex flex-col gap-4">
          <h2 id={`cms-${group}`} className="text-2xl font-semibold">
            {t(`cms.group.${group}`)}
          </h2>
          <ul className="flex flex-col gap-4">
            {EDITABLE_CONTENT.filter((item) => item.group === group).map(({ key }) => {
              const block = data.find((b) => b.key === key)
              // A new key when the text was saved elsewhere, so the fields start from what is stored.
              return (
                <ContentField
                  key={`${key}-${block?.updatedAt ?? 'default'}`}
                  messageKey={key}
                  block={block}
                />
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
