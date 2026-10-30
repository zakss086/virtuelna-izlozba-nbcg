import { Trash2 } from 'lucide-react'

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
import { ErrorNotice } from '@/components/error-notice'
import { SmartImage } from '@/components/smart-image'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/lib/i18n'
import { showToast } from '@/lib/toast'

import { useDeleteMedia, useMediaAssets } from '../api/use-media'
import { kindOf, type MediaAsset } from '../types'
import { MediaUploadForm } from './media-upload-form'

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`

function Preview({ asset }: { asset: MediaAsset }) {
  if (kindOf(asset) === 'video')
    return (
      <video
        src={asset.url}
        controls
        preload="metadata"
        className="aspect-[4/3] w-full bg-ink object-contain"
      />
    )
  return (
    <SmartImage
      src={asset.url}
      alt={asset.filename}
      loading="lazy"
      className="aspect-[4/3] w-full object-cover"
    />
  )
}

// The media library: upload, and the files with their author and licence.
export function MediaLibrary() {
  const { t } = useI18n()
  const { data, isPending, isError, refetch } = useMediaAssets()
  const remove = useDeleteMedia()

  function onDelete(id: number) {
    remove.mutate(id, {
      onSuccess: () => showToast('success', t('media.deleted')),
      onError: () => showToast('error', t('toast.failed')),
    })
  }

  return (
    <div className="flex flex-col gap-10">
      <section
        aria-labelledby="media-add"
        className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6"
      >
        <h2 id="media-add" className="text-2xl font-semibold">
          {t('media.add')}
        </h2>
        <MediaUploadForm />
      </section>

      <section aria-labelledby="media-files" className="flex flex-col gap-4">
        <h2 id="media-files" className="text-2xl font-semibold">
          {t('media.files')}
        </h2>
        {isPending && <Skeleton className="h-48 w-full" aria-busy="true" aria-label={t('common.loading')} />}
        {isError && <ErrorNotice onRetry={() => refetch()} />}
        {data && data.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-muted-foreground">{t('media.empty')}</p>
        )}
        {data && data.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((asset) => (
              <li key={asset.id} className="flex flex-col overflow-hidden rounded-lg border bg-card">
                <Preview asset={asset} />
                <div className="flex flex-1 flex-col gap-2 p-4 text-sm">
                  <p className="font-medium break-all">{asset.filename}</p>
                  <p className="text-muted-foreground">
                    {asset.credit} · {asset.license} · {formatSize(asset.size)}
                  </p>
                  {asset.sourceUrl && (
                    <a
                      href={asset.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-fit text-gold underline-offset-4 hover:underline"
                    >
                      {t('viewer.source')}
                    </a>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="mt-auto w-fit text-destructive">
                        <Trash2 />
                        {t('media.delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>{t('media.deleteTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('media.deleteBody', { name: asset.filename })}
                      </AlertDialogDescription>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('studio.keep')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(asset.id)}>
                          {t('media.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
