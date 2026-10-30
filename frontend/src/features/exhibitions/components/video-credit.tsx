import { ExternalLink } from 'lucide-react'

import { useI18n } from '@/lib/i18n'

import type { ExhibitionVideo } from '../types'

type VideoCreditProps = { video: ExhibitionVideo; className?: string }

// The name of the site the original is on, e.g. "commons.wikimedia.org" or "youtube.com".
function siteName(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'Link'
  }
}

// Author, licence and the page of the original: shown wherever a video is shown.
export function VideoCredit({ video, className }: VideoCreditProps) {
  const { t } = useI18n()

  return (
    <p className={className}>
      {t('videos.credit')}: {video.credit} · {video.license}{' '}
      <a
        href={video.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-gold hover:underline"
      >
        <ExternalLink className="size-3" aria-hidden="true" />
        {siteName(video.sourceUrl)}
      </a>
    </p>
  )
}
