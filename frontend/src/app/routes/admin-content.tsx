import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

import { ContentEditor } from '@/features/content/components/content-editor'
import { useI18n } from '@/lib/i18n'

export function AdminContent() {
  const { t } = useI18n()

  return (
    <section className="flex flex-col gap-8">
      <Link
        to="/admin"
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('cms.back')}
      </Link>
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold">{t('cms.title')}</h1>
        <p className="max-w-prose text-muted-foreground">{t('cms.lead')}</p>
      </div>
      <ContentEditor />
    </section>
  )
}
