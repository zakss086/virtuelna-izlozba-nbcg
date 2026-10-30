import { Search } from 'lucide-react'
import { useState } from 'react'

import { ErrorNotice } from '@/components/error-notice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'
import { messages } from '@/lib/messages'
import { normalizeText } from '@/lib/text'

import { useContentBlocks } from '../api/use-content'
import { CONTENT_GROUPS, EDITABLE_CONTENT } from '../editable-keys'
import { ContentField } from './content-field'

// Every editable site text, grouped by where it appears, with a search over the key and both default texts.
export function ContentEditor() {
  const { t } = useI18n()
  const { data, isPending, isError, refetch } = useContentBlocks()
  const [query, setQuery] = useState('')

  if (isPending) return <Skeleton className="h-64 w-full" aria-busy="true" aria-label={t('common.loading')} />
  if (isError) return <ErrorNotice onRetry={() => refetch()} />

  const needle = normalizeText(query.trim())
  const matches = (key: (typeof EDITABLE_CONTENT)[number]['key']) => {
    if (!needle) return true
    const block = data.find((b) => b.key === key)
    const haystack = [key, messages.me[key], messages.en[key], block?.value.me, block?.value.en].join(' ')
    return normalizeText(haystack).includes(needle)
  }
  const visible = EDITABLE_CONTENT.filter(({ key }) => matches(key))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex max-w-md flex-col gap-2">
        <Label htmlFor="cms-search">{t('cms.search')}</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="cms-search"
            type="search"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {t('cms.count', { a: visible.length, b: EDITABLE_CONTENT.length })}
        </p>
      </div>

      {visible.length === 0 && <p className="text-muted-foreground">{t('cms.none')}</p>}

      <div className="flex flex-col gap-4">
        {CONTENT_GROUPS.map((group) => {
          const items = visible.filter((item) => item.group === group)
          if (items.length === 0) return null
          return (
            <details
              key={`${group}-${needle ? 'search' : 'all'}`}
              open={Boolean(needle) || group === 'home'}
              className="rounded-lg border"
            >
              <summary className="cursor-pointer px-4 py-3 text-xl font-semibold">
                {t(`cms.group.${group}`)}{' '}
                <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
              </summary>
              <ul className="flex flex-col gap-4 p-4 pt-0">
                {items.map(({ key }) => {
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
            </details>
          )
        })}
      </div>
    </div>
  )
}
