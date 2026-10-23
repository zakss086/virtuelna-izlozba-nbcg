import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { TEMPLATES, type Exhibition, type ExhibitionTemplate } from '../types'
import { ExhibitionsGrid } from './exhibitions-grid'

type ExhibitionsExplorerProps = {
  renderAction?: (exhibition: Exhibition) => ReactNode
}

function parseTemplate(value: string | null): ExhibitionTemplate | undefined {
  return TEMPLATES.find((template) => template === value)
}

// Catalog with search and template filter; state lives in the URL so results can be shared.
export function ExhibitionsExplorer({ renderAction }: ExhibitionsExplorerProps) {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const search = params.get('q') ?? ''
  const template = parseTemplate(params.get('template'))

  function update(next: { q?: string; template?: ExhibitionTemplate | undefined }) {
    const copy = new URLSearchParams(params)
    if ('q' in next) {
      if (next.q) copy.set('q', next.q)
      else copy.delete('q')
    }
    if ('template' in next) {
      if (next.template) copy.set('template', next.template)
      else copy.delete('template')
    }
    setParams(copy, { replace: true })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Label htmlFor="catalog-search" className="sr-only">
            {t('catalog.search')}
          </Label>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="catalog-search"
            type="search"
            value={search}
            placeholder={t('catalog.searchPlaceholder')}
            onChange={(event) => update({ q: event.target.value })}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('catalog.template')}>
          {[undefined, ...TEMPLATES].map((tpl) => (
            <button
              key={tpl ?? 'all'}
              type="button"
              aria-pressed={template === tpl}
              onClick={() => update({ template: tpl })}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                template === tpl ? 'border-accent bg-accent text-accent-foreground' : 'hover:bg-muted',
              )}
            >
              {tpl ? t(`tpl.${tpl}`) : t('catalog.all')}
            </button>
          ))}
        </div>
      </div>

      <ExhibitionsGrid
        filters={{ status: 'published', search, template }}
        renderAction={renderAction}
        onReset={() => setParams({}, { replace: true })}
      />
    </div>
  )
}
