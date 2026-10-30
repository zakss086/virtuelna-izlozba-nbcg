import { useNavigate } from 'react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'
import { showToast } from '@/lib/toast'

import { useCreateLibrary, useLibrary, useUpdateLibrary } from '../api/use-libraries'
import type { NewLibrary } from '../types'
import { LibraryForm } from './library-form'

type LibraryEditorProps = {
  /** From the URL; undefined when adding a new library. */
  id: number | undefined
}

export function LibraryEditor({ id }: LibraryEditorProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const existing = useLibrary(id)
  const create = useCreateLibrary()
  const update = useUpdateLibrary()

  if (id !== undefined && existing.isPending) return <Skeleton className="h-96 w-full" aria-busy="true" />
  if (id !== undefined && existing.isError) return <p role="alert">{t('adm.notFound')}</p>

  function onSubmit(value: NewLibrary) {
    const callbacks = {
      onSuccess: () => {
        showToast('success', t('adm.saved'))
        navigate('/admin/libraries')
      },
      onError: () => showToast('error', t('adm.saveFailed')),
    }
    if (id !== undefined) update.mutate({ id, changes: value }, callbacks)
    else create.mutate(value, callbacks)
  }

  return (
    <LibraryForm
      initial={existing.data}
      isSaving={create.isPending || update.isPending}
      onSubmit={onSubmit}
      onCancel={() => navigate('/admin/libraries')}
    />
  )
}
