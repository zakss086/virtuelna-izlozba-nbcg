import { SmartImage } from '@/components/smart-image'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

import { useExhibition } from '../api/use-exhibitions'
import { useFullscreen } from '../hooks/use-fullscreen'
import { ExhibitionCatalog } from './exhibition-catalog'
import { ExhibitionIntro } from './exhibition-intro'
import { ExhibitionVideos } from './exhibition-videos'
import { ExhibitionViewer } from './exhibition-viewer'
import { RelatedExhibitions } from './related-exhibitions'
import { ViewToolbar } from './view-toolbar'
import { availableTemplates, parseTemplate } from './view-modes'

type ExhibitionDetailProps = {
  slug: string | undefined
  /** Slot for page-level actions (save, share). */
  actions?: (exhibitionId: number) => ReactNode
}

export function ExhibitionDetail({ slug, actions }: ExhibitionDetailProps) {
  const { t, l } = useI18n()
  const { data, isPending, isError } = useExhibition(slug)
  const [params, setParams] = useSearchParams()
  const fullscreen = useFullscreen<HTMLDivElement>()

  if (isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 py-12">
        <p className="text-lg">{t('viewer.notFound')}</p>
        <Button asChild variant="outline">
          <Link to="/exhibitions">{t('viewer.back')}</Link>
        </Button>
      </div>
    )
  }

  const objects = data.sections.reduce((sum, s) => sum + s.items.length, 0)
  const options = availableTemplates(data)
  const requested = parseTemplate(params.get('view'))
  const view = requested && options.includes(requested) ? requested : data.template

  function changeView(next: typeof view) {
    const copy = new URLSearchParams(params)
    if (next === data?.template) copy.delete('view')
    else copy.set('view', next)
    setParams(copy, { replace: true })
  }

  return (
    <>
      <article className="flex flex-col gap-8 print:hidden">
        <header className="relative -mx-4 overflow-hidden bg-ink text-on-ink sm:mx-0 sm:rounded-lg">
          <SmartImage
            src={data.coverUrl}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-60"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20"
          />
          <div className="relative flex min-h-72 flex-col justify-end gap-4 p-6 sm:p-8 lg:min-h-96 lg:p-16">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="accent">{t(`tpl.${data.template}`)}</Badge>
              <span className="text-sm opacity-80">{data.period}</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              {l(data.title)}
            </h1>
            <p className="max-w-2xl text-lg opacity-90">{l(data.summary)}</p>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-sm opacity-90">
              <p>
                {t('viewer.by')}: {data.authorName} · {objects} {t('viewer.objects')}
              </p>
              {actions?.(data.id)}
            </div>
          </div>
        </header>

        <ExhibitionIntro exhibition={data} />
        <ViewToolbar view={view} options={options} onViewChange={changeView} fullscreen={fullscreen} />
        <div ref={fullscreen.ref} className={cn(fullscreen.active && 'overflow-auto bg-background p-6')}>
          <ExhibitionViewer exhibition={{ ...data, template: view }} />
        </div>
        <ExhibitionVideos videos={data.videos} />
        <RelatedExhibitions exhibition={data} />
      </article>
      <ExhibitionCatalog exhibition={data} />
    </>
  )
}
