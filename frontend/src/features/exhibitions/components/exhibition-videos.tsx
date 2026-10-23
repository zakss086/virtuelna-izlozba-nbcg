import { useI18n } from '@/lib/i18n'

import type { ExhibitionVideo } from '../types'
import { VideoCard } from './video-card'

type ExhibitionVideosProps = { videos: ExhibitionVideo[] }

export function ExhibitionVideos({ videos }: ExhibitionVideosProps) {
  const { t } = useI18n()
  if (videos.length === 0) return null

  return (
    <section aria-labelledby="exhibition-videos" className="flex flex-col gap-6 border-t pt-10">
      <h2 id="exhibition-videos" className="text-3xl font-semibold">
        {t('videos.section')}
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  )
}
