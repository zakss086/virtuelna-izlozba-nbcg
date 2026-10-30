import { Upload } from 'lucide-react'
import { useId, useRef, useState, type KeyboardEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import { ApiError } from '@/lib/http'
import { showToast } from '@/lib/toast'

import { useUploadMedia } from '../api/use-media'
import type { MediaAsset } from '../types'

const LICENSES = ['CC BY-SA 4.0', 'CC BY 4.0', 'CC0', 'Public domain']

type MediaUploadFormProps = {
  /** Called with the new file, e.g. so the picker can choose it at once. */
  onUploaded?: (asset: MediaAsset) => void
}

// Add a picture or video with the author and licence the site must show next to it.
// Not a <form>: the picker sits inside the exhibition editor's form, and a nested one would submit that too.
export function MediaUploadForm({ onUploaded }: MediaUploadFormProps) {
  const { t } = useI18n()
  const upload = useUploadMedia()
  const id = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [credit, setCredit] = useState('')
  const [license, setLicense] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [fileError, setFileError] = useState<string | undefined>()

  const complete = file !== null && credit.trim() !== '' && license.trim() !== ''

  function submit() {
    if (!file || !complete) return
    setFileError(undefined)
    upload.mutate(
      { file, credit: credit.trim(), license: license.trim(), sourceUrl: sourceUrl.trim() },
      {
        onSuccess: (asset) => {
          showToast('success', t('media.uploaded'))
          setFile(null)
          setCredit('')
          setLicense('')
          setSourceUrl('')
          if (fileInput.current) fileInput.current.value = ''
          onUploaded?.(asset)
        },
        onError: (error) => {
          // The server explains a refused file (wrong type, too large); other failures get the general text.
          if (error instanceof ApiError && error.fieldErrors?.file) setFileError(error.fieldErrors.file)
          else showToast('error', t('media.uploadFailed'))
        },
      },
    )
  }

  // Enter in a text field uploads, and never reaches the editor's form around the picker.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.type !== 'file') {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div role="group" aria-label={t('media.add')} onKeyDown={onKeyDown} className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor={`${id}-file`}>{t('media.file')}</Label>
        <Input
          id={`${id}-file`}
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          aria-invalid={Boolean(fileError)}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null)
            setFileError(undefined)
          }}
        />
        <p className="text-sm text-muted-foreground">{t('media.fileHint')}</p>
        {fileError && (
          <p role="alert" className="text-sm text-destructive">
            {fileError}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-credit`}>{t('media.credit')}</Label>
        <Input
          id={`${id}-credit`}
          value={credit}
          onChange={(event) => setCredit(event.target.value)}
          maxLength={200}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-license`}>{t('media.license')}</Label>
        <Input
          id={`${id}-license`}
          list={`${id}-licenses`}
          value={license}
          onChange={(event) => setLicense(event.target.value)}
          maxLength={100}
        />
        <datalist id={`${id}-licenses`}>
          {LICENSES.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor={`${id}-source`}>{t('media.source')}</Label>
        <Input
          id={`${id}-source`}
          type="url"
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          maxLength={2000}
        />
      </div>
      <div className="md:col-span-2">
        <Button type="button" onClick={submit} disabled={!complete || upload.isPending}>
          <Upload />
          {upload.isPending ? t('media.uploading') : t('media.upload')}
        </Button>
      </div>
    </div>
  )
}
