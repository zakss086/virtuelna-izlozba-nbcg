import { X } from 'lucide-react'

import { SmartImage } from '@/components/smart-image'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { NO_IMAGE, type ImageValue } from '@/lib/image-value'
import { useI18n } from '@/lib/i18n'

import { useMediaAssets } from '../api/use-media'
import { kindOf, type MediaAsset } from '../types'
import { MediaUploadForm } from './media-upload-form'

type MediaPickerProps = {
  value: ImageValue
  onChange: (next: ImageValue) => void
}

const toImage = (asset: MediaAsset): ImageValue => ({
  url: asset.url,
  rights: `${asset.license} · ${asset.credit}`,
  sourceUrl: asset.sourceUrl ?? '',
})

// Choose the picture of an exhibition object from the media library, or upload a new one on the spot.
export function MediaPicker({ value, onChange }: MediaPickerProps) {
  const { t } = useI18n()
  const { data, isPending } = useMediaAssets()
  const images = (data ?? []).filter((asset) => kindOf(asset) === 'image')

  return (
    <div className="flex flex-col gap-3 md:col-span-2">
      <p className="text-sm font-medium">{t('media.pickerTitle')}</p>
      {value.url ? (
        <div className="flex items-center gap-4">
          <SmartImage src={value.url} alt="" className="size-20 rounded-md object-cover" />
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">{value.rights}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => onChange(NO_IMAGE)}
            >
              <X />
              {t('media.pickerRemove')}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('media.pickerNone')}</p>
      )}
      <details className="rounded-lg border p-3">
        <summary className="cursor-pointer text-sm font-medium">{t('media.pickerOpen')}</summary>
        <div className="mt-4 flex flex-col gap-6">
          {isPending && (
            <Skeleton className="h-20 w-full" aria-busy="true" aria-label={t('common.loading')} />
          )}
          {data && images.length === 0 && <p className="text-sm text-muted-foreground">{t('media.empty')}</p>}
          {images.length > 0 && (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {images.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => onChange(toImage(asset))}
                    aria-pressed={value.url === asset.url}
                    aria-label={asset.filename}
                    className="block w-full overflow-hidden rounded-md border-2 border-transparent focus-visible:outline-2 focus-visible:outline-ring aria-pressed:border-accent"
                  >
                    <SmartImage
                      src={asset.url}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-col gap-3 border-t pt-4">
            <p className="text-sm font-medium">{t('media.add')}</p>
            <MediaUploadForm onUploaded={(asset) => kindOf(asset) === 'image' && onChange(toImage(asset))} />
          </div>
        </div>
      </details>
    </div>
  )
}
