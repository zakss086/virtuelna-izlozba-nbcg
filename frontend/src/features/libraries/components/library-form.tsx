import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { FormError } from '@/components/form-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/lib/i18n'
import type { MessageKey } from '@/lib/messages'

import { LIBRARY_TYPES, type Library, type NewLibrary } from '../types'
import {
  libraryFormSchema,
  toLibraryFormValues,
  toNewLibrary,
  type LibraryFormValues,
} from './library-form-model'

type TextField = Exclude<keyof LibraryFormValues, 'type' | 'precision'>

const TEXT_FIELDS: { name: TextField; label: MessageKey; type?: string }[] = [
  { name: 'name', label: 'adm.name' },
  { name: 'city', label: 'adm.city' },
  { name: 'address', label: 'adm.address' },
  { name: 'website', label: 'adm.website', type: 'url' },
  { name: 'email', label: 'adm.email', type: 'email' },
  { name: 'phone', label: 'adm.phone' },
]

const IMAGE_FIELDS: { name: TextField; label: MessageKey; type?: string }[] = [
  { name: 'imageUrl', label: 'adm.imageUrl' },
  { name: 'imageCredit', label: 'adm.imageCredit' },
  { name: 'imageLicense', label: 'adm.imageLicense' },
  { name: 'imageSourceUrl', label: 'adm.imageSource', type: 'url' },
]

type LibraryFormProps = {
  initial?: Library
  isSaving: boolean
  onSubmit: (value: NewLibrary) => void
  onCancel: () => void
}

// An admin edits one library of the map: facts, a free photo with its credit, and the position of the pin.
export function LibraryForm({ initial, isSaving, onSubmit, onCancel }: LibraryFormProps) {
  const { t } = useI18n()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LibraryFormValues>({
    resolver: zodResolver(libraryFormSchema),
    defaultValues: toLibraryFormValues(initial),
  })

  const field = (name: TextField, label: MessageKey, type?: string) => (
    <div key={name} className="flex flex-col gap-2">
      <Label htmlFor={`lib-${name}`}>{t(label)}</Label>
      <Input id={`lib-${name}`} type={type} aria-invalid={Boolean(errors[name])} {...register(name)} />
      <FormError isInvalid={Boolean(errors[name])} messageKey="adm.err.invalid" />
    </div>
  )

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(toNewLibrary(values)))}
      className="flex max-w-3xl flex-col gap-8"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        {TEXT_FIELDS.slice(0, 2).map((item) => field(item.name, item.label, item.type))}
        <div className="flex flex-col gap-2">
          <Label htmlFor="lib-type">{t('adm.type')}</Label>
          <Controller
            control={control}
            name="type"
            render={({ field: select }) => (
              <Select value={select.value} onValueChange={select.onChange}>
                <SelectTrigger id="lib-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIBRARY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`libraries.type.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {TEXT_FIELDS.slice(2).map((item) => field(item.name, item.label, item.type))}
      </div>

      <fieldset className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <legend className="px-2 font-medium">{t('adm.description')}</legend>
        {(['descriptionMe', 'descriptionEn'] as const).map((name) => (
          <div key={name} className="flex flex-col gap-2">
            <Label htmlFor={`lib-${name}`}>{t(name === 'descriptionMe' ? 'cms.me' : 'cms.en')}</Label>
            <Textarea id={`lib-${name}`} rows={3} aria-invalid={Boolean(errors[name])} {...register(name)} />
            <FormError isInvalid={Boolean(errors[name])} messageKey="adm.err.both" />
          </div>
        ))}
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <legend className="px-2 font-medium">{t('adm.image')}</legend>
        <p className="text-sm text-muted-foreground md:col-span-2">{t('adm.imageHint')}</p>
        {IMAGE_FIELDS.map((item) => field(item.name, item.label, item.type))}
        <div className="md:col-span-2">
          <FormError isInvalid={Boolean(errors.imageUrl)} messageKey="adm.err.image" />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border p-4 md:grid-cols-3">
        <legend className="px-2 font-medium">{t('adm.location')}</legend>
        <p className="text-sm text-muted-foreground md:col-span-3">{t('adm.locationHint')}</p>
        {field('lat', 'adm.lat')}
        {field('lng', 'adm.lng')}
        <div className="flex flex-col gap-2">
          <Label htmlFor="lib-precision">{t('adm.precision')}</Label>
          <Controller
            control={control}
            name="precision"
            render={({ field: select }) => (
              <Select
                value={select.value || 'none'}
                onValueChange={(v) => select.onChange(v === 'none' ? '' : v)}
              >
                <SelectTrigger id="lib-precision" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('adm.noPin')}</SelectItem>
                  <SelectItem value="exact">{t('adm.precision.exact')}</SelectItem>
                  <SelectItem value="town">{t('adm.precision.town')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="md:col-span-3">
          <FormError isInvalid={Boolean(errors.lat)} messageKey="adm.err.location" />
        </div>
      </fieldset>

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
