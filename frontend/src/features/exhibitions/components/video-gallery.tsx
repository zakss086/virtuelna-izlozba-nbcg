import { ErrorNotice } from '@/components/error-notice'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useVideoEntries } from '../api/use-video-entries'
import { VideoFilmstrip } from './video-filmstrip'

type VideoGalleryProps = { limit?: number }

// All videos of published exhibitions in one place, as a film strip.
export function VideoGallery({ limit }: VideoGalleryProps) {
  const { t } = useI18n()
  const { entries, isPending, isError, refetch } = useVideoEntries()

  if (isPending) return <Skeleton className="h-64 w-full" aria-busy="true" aria-label={t('common.loading')} />
  if (isError) return <ErrorNotice onRetry={() => refetch()} />
  if (entries.length === 0) return <p className="text-muted-foreground">{t('videos.empty')}</p>

  return <VideoFilmstrip entries={limit ? entries.slice(0, limit) : entries} />
}
