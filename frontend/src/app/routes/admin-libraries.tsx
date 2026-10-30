import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { LibraryAdminList } from '@/features/libraries/components/library-admin-list'
import { LibraryEditor } from '@/features/libraries/components/library-editor'
import { useI18n } from '@/lib/i18n'

function BackLink({ to }: { to: string }) {
  const { t } = useI18n()

  return (
    <Link
      to={to}
      className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {t('adm.back')}
    </Link>
  )
}

export function AdminLibraries() {
  const { t } = useI18n()

  return (
    <section className="flex flex-col gap-8">
      <BackLink to="/admin" />
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold">{t('adm.libraries.title')}</h1>
        <p className="max-w-prose text-muted-foreground">{t('adm.libraries.lead')}</p>
      </div>
      <LibraryAdminList />
    </section>
  )
}

export function AdminLibraryEditor() {
  const { t } = useI18n()
  const { id } = useParams()

  return (
    <section className="flex flex-col gap-8">
      <BackLink to="/admin/libraries" />
      <h1 className="text-4xl font-semibold">{id ? t('adm.libraries.edit') : t('adm.libraries.new')}</h1>
      <LibraryEditor id={id ? Number(id) : undefined} />
    </section>
  )
}
