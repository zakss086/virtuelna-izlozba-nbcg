import { Trash2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/lib/i18n'

import type { FormValues } from './exhibition-form-model'
import { FieldError } from './field-error'
import { parseEmbedSource } from './video-embed-source'

type VideoFieldsProps = { index: number; onRemove: () => void }

// One video of the exhibition: a file address or a YouTube / Vimeo link, texts in both languages, author and licence.
export function VideoFields({ index, onRemove }: VideoFieldsProps) {
  const { t } = useI18n()
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>()
  const videoErrors = errors.videos?.[index]
  const source = watch(`videos.${index}.src`)
  const embed = parseEmbedSource(source)

  return (
    <fieldset className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
      <legend className="px-2 font-medium">
        {t('editor.video')} {index + 1}
      </legend>
      {(
        [
          ['titleMe', 'editor.videoTitleMe', 'input'],
          ['titleEn', 'editor.videoTitleEn', 'input'],
          ['descriptionMe', 'editor.videoDescMe', 'textarea'],
          ['descriptionEn', 'editor.videoDescEn', 'textarea'],
        ] as const
      ).map(([name, label, kind]) => {
        const id = `v${index}-${name}`
        return (
          <div key={name} className="flex flex-col gap-2">
            <Label htmlFor={id}>{t(label)}</Label>
            {kind === 'input' ? (
              <Input
                id={id}
                aria-invalid={Boolean(videoErrors?.[name])}
                {...register(`videos.${index}.${name}`)}
              />
            ) : (
              <Textarea
                id={id}
                rows={2}
                aria-invalid={Boolean(videoErrors?.[name])}
                {...register(`videos.${index}.${name}`)}
              />
            )}
            <FieldError message={videoErrors?.[name]?.message} />
          </div>
        )
      })}
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor={`v${index}-src`}>{t('editor.videoSrc')}</Label>
        <Input
          id={`v${index}-src`}
          type="url"
          placeholder="https://www.youtube.com/watch?v=…"
          aria-invalid={Boolean(videoErrors?.src)}
          {...register(`videos.${index}.src`)}
        />
        <p className="text-xs text-muted-foreground">
          {embed ? t('editor.videoRecognised', { provider: embed.providerName }) : t('editor.videoSrcHint')}
        </p>
        <FieldError message={videoErrors?.src?.message} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`v${index}-credit`}>{t('editor.videoCredit')}</Label>
        <Input
          id={`v${index}-credit`}
          aria-invalid={Boolean(videoErrors?.credit)}
          {...register(`videos.${index}.credit`)}
        />
        <FieldError message={videoErrors?.credit?.message} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`v${index}-license`}>{t('editor.videoLicense')}</Label>
        <Input
          id={`v${index}-license`}
          placeholder="CC BY-SA 4.0"
          aria-invalid={Boolean(videoErrors?.license)}
          {...register(`videos.${index}.license`)}
        />
        <FieldError message={videoErrors?.license?.message} />
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor={`v${index}-source`}>{t('editor.videoSource')}</Label>
        <Input
          id={`v${index}-source`}
          type="url"
          aria-invalid={Boolean(videoErrors?.sourceUrl)}
          {...register(`videos.${index}.sourceUrl`)}
        />
        <p className="text-xs text-muted-foreground">{t('editor.videoSourceHint')}</p>
        <FieldError message={videoErrors?.sourceUrl?.message} />
      </div>
      <div className="md:col-span-2">
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 />
          {t('editor.removeVideo')}
        </Button>
      </div>
    </fieldset>
  )
}
