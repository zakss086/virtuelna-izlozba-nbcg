import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/lib/i18n'

import { TEMPLATES, type Exhibition, type ExhibitionStatus, type NewExhibition } from '../types'
import {
  emptySection,
  exhibitionFormSchema,
  toExhibition,
  toFormValues,
  type FormValues,
} from './exhibition-form-model'
import { FieldError } from './field-error'
import { SectionFields } from './section-fields'

type ExhibitionFormProps = {
  initial?: Exhibition
  authorId: number
  authorName: string
  isSaving: boolean
  onSubmit: (value: NewExhibition) => void
  onCancel: () => void
}

export function ExhibitionForm({
  initial,
  authorId,
  authorName,
  isSaving,
  onSubmit,
  onCancel,
}: ExhibitionFormProps) {
  const { t } = useI18n()
  const form = useForm<FormValues>({
    resolver: zodResolver(exhibitionFormSchema),
    defaultValues: toFormValues(initial),
  })
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'sections' })

  const submit = (status: ExhibitionStatus) =>
    handleSubmit((values) =>
      onSubmit(toExhibition(values, authorId, authorName, status, initial?.videos ?? [])),
    )

  return (
    <FormProvider {...form}>
      <form
        onSubmit={submit(initial?.status === 'published' ? 'published' : 'draft')}
        className="flex flex-col gap-8"
        noValidate
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="titleMe">{t('editor.titleMe')}</Label>
            <Input id="titleMe" aria-invalid={Boolean(errors.titleMe)} {...register('titleMe')} />
            <FieldError message={errors.titleMe?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="titleEn">{t('editor.titleEn')}</Label>
            <Input id="titleEn" aria-invalid={Boolean(errors.titleEn)} {...register('titleEn')} />
            <FieldError message={errors.titleEn?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="summaryMe">{t('editor.summaryMe')}</Label>
            <Textarea
              id="summaryMe"
              rows={3}
              aria-invalid={Boolean(errors.summaryMe)}
              {...register('summaryMe')}
            />
            <FieldError message={errors.summaryMe?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="summaryEn">{t('editor.summaryEn')}</Label>
            <Textarea
              id="summaryEn"
              rows={3}
              aria-invalid={Boolean(errors.summaryEn)}
              {...register('summaryEn')}
            />
            <FieldError message={errors.summaryEn?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="template">{t('catalog.template')}</Label>
            <Controller
              control={control}
              name="template"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="template" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((tpl) => (
                      <SelectItem key={tpl} value={tpl}>
                        {t(`tpl.${tpl}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="period">{t('editor.period')}</Label>
            <Input
              id="period"
              placeholder="1900 – 1950"
              aria-invalid={Boolean(errors.period)}
              {...register('period')}
            />
            <FieldError message={errors.period?.message} />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="tags">{t('editor.tags')}</Label>
            <Input id="tags" {...register('tags')} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold">{t('editor.sections')}</h2>
          <FieldError message={errors.sections?.root?.message} messageKey="editor.minSections" />
          {fields.map((field, index) => (
            <SectionFields
              key={field.id}
              index={index}
              onRemove={fields.length > 1 ? () => remove(index) : undefined}
            />
          ))}
          <Button type="button" variant="outline" className="w-fit" onClick={() => append(emptySection)}>
            <Plus />
            {t('editor.addSection')}
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSaving}>
            {initial?.status === 'published' ? t('editor.saved') : t('editor.saveDraft')}
          </Button>
          {initial?.status !== 'published' && (
            <Button type="button" variant="secondary" disabled={isSaving} onClick={submit('pending')}>
              {t('editor.saveSubmit')}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('editor.cancel')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
