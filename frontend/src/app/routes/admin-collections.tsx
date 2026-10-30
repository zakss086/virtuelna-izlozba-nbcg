import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { CollectionAdminList } from '@/features/collections/components/collection-admin-list'
import { CollectionEditor } from '@/features/collections/components/collection-editor'
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

export function AdminCollections() {
  const { t } = useI18n()

  return (
    <section className="flex flex-col gap-8">
      <BackLink to="/admin" />
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold">{t('adm.collections.title')}</h1>
        <p className="max-w-prose text-muted-foreground">{t('adm.collections.lead')}</p>
      </div>
      <CollectionAdminList />
    </section>
  )
}

export function AdminCollectionEditor() {
  const { t } = useI18n()
  const { id } = useParams()

  return (
    <section className="flex flex-col gap-8">
      <BackLink to="/admin/collections" />
      <h1 className="text-4xl font-semibold">{id ? t('adm.collections.edit') : t('adm.collections.new')}</h1>
      <CollectionEditor id={id ? Number(id) : undefined} />
    </section>
  )
}
