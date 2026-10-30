import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { ErrorNotice } from '@/components/error-notice'
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

import { useDeleteLibrary, useLibraries } from '../api/use-libraries'

// All libraries of the map with edit and delete, for an admin.
export function LibraryAdminList() {
  const { t } = useI18n()
  const { data, isPending, isError, refetch } = useLibraries()
  const remove = useDeleteLibrary()

  function onDelete(id: number) {
    remove.mutate(id, {
      onSuccess: () => showToast('success', t('adm.deleted')),
      onError: () => showToast('error', t('toast.failed')),
    })
  }

  if (isPending) return <Skeleton className="h-64 w-full" aria-busy="true" aria-label={t('common.loading')} />
  if (isError) return <ErrorNotice onRetry={() => refetch()} />

  return (
    <div className="flex flex-col gap-4">
      <Button asChild className="w-fit">
        <Link to="/admin/libraries/new">
          <Plus />
          {t('adm.new')}
        </Link>
      </Button>
      <ul className="flex flex-col divide-y rounded-lg border">
        {data.map((library) => (
          <li key={library.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-col">
              <span className="font-medium">{library.name}</span>
              <span className="text-sm text-muted-foreground">
                {library.city} · {t(`libraries.type.${library.type}`)}
                {library.location ? '' : ` · ${t('adm.noPin')}`}
              </span>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/libraries/${library.id}`}>
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
                    {t('adm.deleteBody', { name: library.name })}
                  </AlertDialogDescription>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('studio.keep')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(library.id)}>
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
