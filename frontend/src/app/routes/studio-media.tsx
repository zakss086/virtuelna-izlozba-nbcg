import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

import { MediaLibrary } from '@/features/media/components/media-library'
import { useI18n } from '@/lib/i18n'

export function StudioMedia() {
  const { t } = useI18n()

  return (
    <section className="flex flex-col gap-8">
      <Link
        to="/studio"
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('media.back')}
      </Link>
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold">{t('media.title')}</h1>
        <p className="max-w-prose text-muted-foreground">{t('media.lead')}</p>
      </div>
      <MediaLibrary />
    </section>
  )
}
