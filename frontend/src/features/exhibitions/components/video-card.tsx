import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'

import { useI18n } from '@/lib/i18n'

import type { ExhibitionVideo } from '../types'

type VideoCardProps = {
  video: ExhibitionVideo
  /** Optional line under the description, e.g. a link to the source exhibition. */
  footer?: ReactNode
}

export function VideoCard({ video, footer }: VideoCardProps) {
  const { t, l } = useI18n()

  return (
    <figure className="flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground">
      <video
        controls
        preload="metadata"
        playsInline
        aria-label={l(video.title)}
        className="aspect-video w-full bg-ink"
      >
        <source src={video.src} type="video/webm" />
      </video>
      <figcaption className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold">{l(video.title)}</h3>
        <p className="text-sm text-muted-foreground">{l(video.description)}</p>
        {footer}
        <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-2 text-xs text-muted-foreground">
          <span>
            {t('videos.credit')}: {video.credit} · {video.license}
          </span>
          <a
            href={video.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-gold hover:underline"
          >
            <ExternalLink className="size-3" aria-hidden="true" />
            <span className="sr-only">{t('videos.credit')}</span>
            Commons
          </a>
        </p>
      </figcaption>
    </figure>
  )
}
