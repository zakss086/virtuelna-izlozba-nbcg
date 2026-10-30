import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { FormError } from '@/components/form-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/lib/i18n'

import type { Collection, NewCollection } from '../types'

const schema = z.object({
  nameMe: z.string().trim().min(1),
  nameEn: z.string().trim().min(1),
  textMe: z.string().trim().min(1),
  textEn: z.string().trim().min(1),
  href: z.string().trim().min(1),
  image: z.string().trim().min(1),
  position: z.string().refine((value) => /^\d{1,5}$/.test(value.trim())),
})
type FormValues = z.infer<typeof schema>

function toValues(collection?: Collection): FormValues {
  return {
    nameMe: collection?.name.me ?? '',
    nameEn: collection?.name.en ?? '',
    textMe: collection?.text.me ?? '',
    textEn: collection?.text.en ?? '',
    href: collection?.href ?? '',
    image: collection?.image ?? '',
    position: String(collection?.position ?? 0),
  }
}

type CollectionFormProps = {
  initial?: Collection
  isSaving: boolean
  onSubmit: (value: NewCollection) => void
  onCancel: () => void
}

// An admin edits one collection of the Collections page, in both languages.
export function CollectionForm({ initial, isSaving, onSubmit, onCancel }: CollectionFormProps) {
  const { t } = useI18n()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toValues(initial) })

  const input = (name: keyof FormValues, label: Parameters<typeof t>[0], multiline = false) => (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`col-${name}`}>{t(label)}</Label>
      {multiline ? (
        <Textarea id={`col-${name}`} rows={3} aria-invalid={Boolean(errors[name])} {...register(name)} />
      ) : (
        <Input id={`col-${name}`} aria-invalid={Boolean(errors[name])} {...register(name)} />
      )}
      <FormError isInvalid={Boolean(errors[name])} messageKey="adm.err.invalid" />
    </div>
  )

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          name: { me: values.nameMe.trim(), en: values.nameEn.trim() },
          text: { me: values.textMe.trim(), en: values.textEn.trim() },
          href: values.href.trim(),
          image: values.image.trim(),
          position: Number(values.position),
        }),
      )}
      className="flex max-w-3xl flex-col gap-6"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        {input('nameMe', 'adm.nameMe')}
        {input('nameEn', 'adm.nameEn')}
        {input('textMe', 'adm.textMe', true)}
        {input('textEn', 'adm.textEn', true)}
        {input('href', 'adm.href')}
        {input('image', 'adm.imageUrlShort')}
        {input('position', 'adm.position')}
      </div>
      <p className="text-sm text-muted-foreground">{t('adm.collectionHint')}</p>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          {t('adm.save')}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('editor.cancel')}
        </Button>
      </div>
    </form>
  )
}
