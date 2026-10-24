import { useNavigate } from 'react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'
import { showToast } from '@/lib/toast'

import { useCreateExhibition, useExhibition, useUpdateExhibition } from '../api/use-exhibitions'
import type { NewExhibition } from '../types'
import { ExhibitionForm } from './exhibition-form'

type EditorLoaderProps = {
  /** Exhibition id from the URL; undefined when creating a new one. */
  id: string | undefined
  authorId: number
  authorName: string
  isAdmin: boolean
}

export function EditorLoader({ id, authorId, authorName, isAdmin }: EditorLoaderProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const existing = useExhibition(id)
  const create = useCreateExhibition()
  const update = useUpdateExhibition()

  if (id && existing.isPending) return <Skeleton className="h-96 w-full" aria-busy="true" />
  if (id && existing.isError) return <p role="alert">{t('viewer.notFound')}</p>

  const initial = existing.data
  if (initial && !isAdmin && initial.authorId !== authorId) return <p role="alert">{t('auth.forbidden')}</p>

  function handleSubmit(value: NewExhibition) {
    const callbacks = {
      onSuccess: () => {
        showToast('success', t('toast.saved'))
        navigate('/studio')
      },
      onError: () => showToast('error', t('toast.failed')),
    }
    if (initial) update.mutate({ id: initial.id, changes: value }, callbacks)
    else create.mutate(value, callbacks)
  }

  return (
    <ExhibitionForm
      initial={initial}
      authorId={initial?.authorId ?? authorId}
      authorName={initial?.authorName ?? authorName}
      isSaving={create.isPending || update.isPending}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/studio')}
    />
  )
}
