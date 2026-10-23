import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { SmartImage } from '@/components/smart-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useExhibitions } from '../api/use-exhibitions'

type FeaturedExhibitionProps = {
  /** Slot for an action button (e.g. save). */
  action?: (exhibitionId: number) => ReactNode
}

// Large editorial feature of the newest published exhibition for the home page.
export function FeaturedExhibition({ action }: FeaturedExhibitionProps) {
  const { t, l } = useI18n()
  const { data, isPending } = useExhibitions({ status: 'published' })

  if (isPending) return <Skeleton className="h-96 w-full" aria-busy="true" />
  const exhibition = data?.find((e) => e.template === 'timeline') ?? data?.[0]
  if (!exhibition) return null

  return (
    <article className="grid overflow-hidden rounded-lg border bg-card text-card-foreground md:grid-cols-2">
      <div className="relative min-h-72 overflow-hidden bg-ink">
        <SmartImage
          src={exhibition.coverUrl}
          alt={l(exhibition.title)}
          className="absolute inset-0 size-full object-cover"
        />
        <Badge variant="accent" className="absolute left-4 top-4">
          {t(`tpl.${exhibition.template}`)}
        </Badge>
      </div>
      <div className="flex flex-col justify-center gap-4 p-8 lg:p-12">
        <p className="text-xs uppercase tracking-widest text-gold">
          {t('home.featured')} · {exhibition.period}
        </p>
        <h3 className="text-3xl font-semibold leading-tight text-balance lg:text-4xl">
          {l(exhibition.title)}
        </h3>
        <p className="text-muted-foreground">{l(exhibition.summary)}</p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild>
            <Link to={`/exhibitions/${exhibition.slug}`}>
              {t('home.featured.read')}
              <ArrowRight />
            </Link>
          </Button>
          {action?.(exhibition.id)}
        </div>
      </div>
    </article>
  )
}
