import { useNavigate } from 'react-router'

import { ErrorNotice } from '@/components/error-notice'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'
import { showToast } from '@/lib/toast'

import { useCollections, useCreateCollection, useUpdateCollection } from '../api/use-collections'
import type { NewCollection } from '../types'
import { CollectionForm } from './collection-form'

type CollectionEditorProps = {
  /** From the URL; undefined when adding a new collection. */
  id: number | undefined
}

export function CollectionEditor({ id }: CollectionEditorProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const all = useCollections()
  const create = useCreateCollection()
  const update = useUpdateCollection()

  if (all.isPending) return <Skeleton className="h-96 w-full" aria-busy="true" />
  if (all.isError) return <ErrorNotice onRetry={() => all.refetch()} />

  const existing = id === undefined ? undefined : all.data.find((collection) => collection.id === id)
  if (id !== undefined && !existing) return <p role="alert">{t('adm.notFound')}</p>

  function onSubmit(value: NewCollection) {
    const callbacks = {
      onSuccess: () => {
        showToast('success', t('adm.saved'))
        navigate('/admin/collections')
      },
      onError: () => showToast('error', t('adm.saveFailed')),
    }
    if (id !== undefined) update.mutate({ id, changes: value }, callbacks)
    else create.mutate(value, callbacks)
  }

  return (
    <CollectionForm
      initial={existing}
      isSaving={create.isPending || update.isPending}
      onSubmit={onSubmit}
      onCancel={() => navigate('/admin/collections')}
    />
  )
}
