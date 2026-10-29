import { SmartImage } from '@/components/smart-image'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n'

import type { Exhibition } from '../types'

type ExhibitionCardProps = {
  exhibition: Exhibition
  /** Slot for an action button (e.g. save) placed over the cover. */
  action?: ReactNode
  to?: string
}

export function ExhibitionCard({ exhibition, action, to }: ExhibitionCardProps) {
  const { t, l } = useI18n()
  const objects = exhibition.sections.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground transition-shadow hover:shadow-lg">
      <div className="passepartout relative aspect-[16/10] overflow-hidden bg-ink">
        <SmartImage
          src={exhibition.coverUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge variant="accent" className="absolute left-3 top-3">
          {t(`tpl.${exhibition.template}`)}
        </Badge>
        {action && <div className="absolute right-3 top-3 z-10">{action}</div>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs uppercase tracking-widest text-gold">{exhibition.period}</p>
        <h3 className="text-xl font-semibold leading-snug">
          <Link
            to={to ?? `/exhibitions/${exhibition.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-ring"
          >
            {l(exhibition.title)}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">{l(exhibition.summary)}</p>
        <p className="mt-auto pt-2 text-xs text-muted-foreground">
          {objects} {t('viewer.objects')}
        </p>
      </div>
    </article>
  )
}
