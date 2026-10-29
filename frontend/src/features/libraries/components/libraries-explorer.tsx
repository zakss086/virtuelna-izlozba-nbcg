import { Search } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'

import { ErrorNotice } from '@/components/error-notice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { useLibraries } from '../api/use-libraries'
import { LIBRARY_TYPES, type Library, type LibraryType } from '../types'
import { LibraryCard } from './library-card'

const LibrariesMap = lazy(() => import('./libraries-map'))

// Case- and diacritic-insensitive text match, so "niksic" finds "Nikšić".
function normalize(text: string) {
  return text
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
}

function matches(library: Library, query: string, type: LibraryType | undefined) {
  if (type && library.type !== type) return false
  if (!query) return true
  return normalize(`${library.name} ${library.city}`).includes(normalize(query))
}

// Map and list of libraries with a name or town search and a type filter.
export function LibrariesExplorer() {
  const { t } = useI18n()
  const { data, isPending, isError, refetch } = useLibraries()
  const [query, setQuery] = useState('')
  const [type, setType] = useState<LibraryType | undefined>(undefined)
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined)

  if (isPending) {
    return <Skeleton className="h-[60vh] w-full" aria-busy="true" aria-label={t('common.loading')} />
  }
  if (isError) return <ErrorNotice onRetry={() => refetch()} />

  const shown = data.filter((library) => matches(library, query.trim(), type))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Label htmlFor="library-search" className="sr-only">
            {t('libraries.search')}
          </Label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="library-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('libraries.search')}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('libraries.filter')}>
          {[undefined, ...LIBRARY_TYPES].map((option) => (
            <button
              key={option ?? 'all'}
              type="button"
              aria-pressed={type === option}
              onClick={() => setType(option)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                type === option ? 'border-accent bg-accent text-accent-foreground' : 'hover:bg-muted',
              )}
            >
              {option ? t(`libraries.type.${option}`) : t('libraries.type.all')}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground" role="status">
          {t('libraries.count', { count: shown.length })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="lg:order-2">
          <Suspense fallback={<Skeleton className="h-[55vh] w-full lg:h-[70vh]" aria-label={t('libraries.mapLoading')} />}>
            <LibrariesMap libraries={shown} selectedId={selectedId} onSelect={setSelectedId} />
          </Suspense>
          <p className="mt-2 text-xs text-muted-foreground">{t('libraries.legend')}</p>
        </div>

        {shown.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-muted-foreground lg:order-1">{t('libraries.empty')}</p>
        ) : (
          <ul className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-2 lg:order-1">
            {shown.map((library) => (
              <LibraryCard
                key={library.id}
                library={library}
                selected={library.id === selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
