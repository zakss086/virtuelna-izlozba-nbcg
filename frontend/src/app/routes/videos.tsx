import { Ornament } from '@/components/ornament'
import { VideoGallery } from '@/features/exhibitions/components/video-gallery'
import { useI18n } from '@/lib/i18n'

export function Videos() {
  const { t } = useI18n()

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-semibold">{t('videos.title')}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t('videos.lead')}</p>
        <Ornament className="mt-4" />
      </div>
      <VideoGallery />
    </section>
  )
}
