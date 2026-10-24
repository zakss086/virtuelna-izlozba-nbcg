import { Link } from 'react-router'

import { ErrorNotice } from '@/components/error-notice'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'

import { useExhibitions } from '../api/use-exhibitions'
import { VideoCard } from './video-card'

type VideoGalleryProps = { limit?: number }

// All videos of published exhibitions in one place.
export function VideoGallery({ limit }: VideoGalleryProps) {
  const { t, l } = useI18n()
  const { data, isPending, isError, refetch } = useExhibitions({ status: 'published' })

  if (isPending) return <Skeleton className="h-64 w-full" aria-busy="true" aria-label={t('common.loading')} />
  if (isError) return <ErrorNotice onRetry={() => refetch()} />

  const entries = data.flatMap((exhibition) => exhibition.videos.map((video) => ({ video, exhibition })))
  if (entries.length === 0) return <p className="text-muted-foreground">{t('videos.empty')}</p>

  const shown = limit ? entries.slice(0, limit) : entries
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {shown.map(({ video, exhibition }) => (
        <VideoCard
          key={video.id}
          video={video}
          footer={
            <p className="text-xs">
              {t('videos.from')}:{' '}
              <Link to={`/exhibitions/${exhibition.slug}`} className="text-gold hover:underline">
                {l(exhibition.title)}
              </Link>
            </p>
          }
        />
      ))}
    </div>
  )
}
