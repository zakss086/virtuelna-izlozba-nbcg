import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { ErrorNotice } from '@/components/error-notice'
import { SmartImage } from '@/components/smart-image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'
import { showToast } from '@/lib/toast'

import { useCollections, useDeleteCollection } from '../api/use-collections'

// All collections with edit and delete, for an admin.
export function CollectionAdminList() {
  const { t, l } = useI18n()
  const { data, isPending, isError, refetch } = useCollections()
  const remove = useDeleteCollection()

  function onDelete(id: number) {
    remove.mutate(id, {
      onSuccess: () => showToast('success', t('adm.deleted')),
      onError: () => showToast('error', t('toast.failed')),
    })
  }

  if (isPending) return <Skeleton className="h-48 w-full" aria-busy="true" aria-label={t('common.loading')} />
  if (isError) return <ErrorNotice onRetry={() => refetch()} />

  return (
    <div className="flex flex-col gap-4">
      <Button asChild className="w-fit">
        <Link to="/admin/collections/new">
          <Plus />
          {t('adm.new')}
        </Link>
      </Button>
      <ul className="flex flex-col divide-y rounded-lg border">
        {data.map((collection) => (
          <li key={collection.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <SmartImage src={collection.image} alt="" className="size-14 rounded object-cover" />
              <div className="flex flex-col">
                <span className="font-medium">{l(collection.name)}</span>
                <span className="text-sm text-muted-foreground">
                  {t('adm.position')}: {collection.position}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/collections/${collection.id}`}>
                  <Pencil />
                  {t('adm.edit')}
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 />
                    <span className="sr-only">{t('adm.delete')}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>{t('adm.deleteTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('adm.deleteBody', { name: l(collection.name) })}
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('studio.keep')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(collection.id)}>
                      {t('adm.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
