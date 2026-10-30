import { Play } from 'lucide-react'
import { useState } from 'react'

import { useI18n } from '@/lib/i18n'

import type { ExhibitionVideo } from '../types'
import type { VideoEmbedSource } from './video-embed-source'

type VideoEmbedProps = { video: ExhibitionVideo; source: VideoEmbedSource }

// Nothing is requested from YouTube or Vimeo until the visitor presses play: no third-party cookies, no tracking,
// and the page stays fast. Only then the provider's own player is loaded.
export function VideoEmbed({ video, source }: VideoEmbedProps) {
  const { t, l } = useI18n()
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <iframe
        src={source.embedUrl}
        title={l(video.title)}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="size-full border-0 bg-ink"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      aria-label={t('videos.play', { title: l(video.title) })}
      className="flex size-full flex-col items-center justify-center gap-3 bg-ink p-4 text-center text-on-ink focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="flex size-14 items-center justify-center rounded-full border border-on-ink/70 bg-ink/50">
        <Play className="size-6 fill-current" aria-hidden="true" />
      </span>
      <span className="max-w-xs text-xs text-on-ink/75">
        {t('videos.embedNotice', { provider: source.providerName })}
      </span>
    </button>
  )
}
