import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { makeArt } from '@/lib/art'
import { useI18n } from '@/lib/i18n'

import { ITEM_TYPES, TEMPLATES, type Exhibition, type ExhibitionStatus, type NewExhibition } from '../types'

const sectionSchema = z.object({
  titleMe: z.string().min(2),
  titleEn: z.string().min(2),
  textMe: z.string().min(10),
  textEn: z.string().min(10),
  year: z.number().int().min(1000).max(2100),
  placeName: z.string(),
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
  objectTitle: z.string().min(2),
  objectCreator: z.string().min(2),
  objectType: z.enum(ITEM_TYPES),
})

const schema = z.object({
  titleMe: z.string().min(3),
  titleEn: z.string().min(3),
  summaryMe: z.string().min(10),
  summaryEn: z.string().min(10),
  template: z.enum(TEMPLATES),
  period: z.string().min(2),
  tags: z.string(),
  sections: z.array(sectionSchema).min(1),
})

type FormValues = z.infer<typeof schema>

const emptySection: FormValues['sections'][number] = {
  titleMe: '',
  titleEn: '',
  textMe: '',
  textEn: '',
  year: 1900,
  placeName: '',
  lat: null,
  lng: null,
  objectTitle: '',
  objectCreator: '',
  objectType: 'photo',
}

function toFormValues(exhibition?: Exhibition): FormValues {
  if (!exhibition) {
    return {
      titleMe: '',
      titleEn: '',
      summaryMe: '',
      summaryEn: '',
      template: 'timeline',
      period: '',
      tags: '',
      sections: [emptySection],
    }
  }
  return {
    titleMe: exhibition.title.me,
    titleEn: exhibition.title.en,
    summaryMe: exhibition.summary.me,
    summaryEn: exhibition.summary.en,
    template: exhibition.template,
    period: exhibition.period,
    tags: exhibition.tags.join(', '),
    sections: exhibition.sections.map((s) => {
      const obj = s.items[0]
      return {
        titleMe: s.title.me,
        titleEn: s.title.en,
        textMe: s.text.me,
        textEn: s.text.en,
        year: s.year ?? obj?.year ?? 1900,
        placeName: s.place?.name.me ?? '',
        lat: s.place?.lat ?? null,
        lng: s.place?.lng ?? null,
        objectTitle: obj?.title.me ?? '',
        objectCreator: obj?.creator ?? '',
        objectType: obj?.type ?? 'photo',
      }
    }),
  }
}

function toExhibition(
  values: FormValues,
  authorId: number,
  authorName: string,
  status: ExhibitionStatus,
  videos: Exhibition['videos'],
): NewExhibition {
  let id = Date.now()
  return {
    title: { me: values.titleMe, en: values.titleEn },
    summary: { me: values.summaryMe, en: values.summaryEn },
    coverUrl: makeArt(values.sections[0]?.objectType ?? 'book', values.titleMe, values.period, true),
    template: values.template,
    status,
    period: values.period,
    tags: values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    authorId,
    authorName,
    videos,
    sections: values.sections.map((s) => ({
      id: id++,
      title: { me: s.titleMe, en: s.titleEn },
      text: { me: s.textMe, en: s.textEn },
      year: s.year,
      place:
        s.placeName && s.lat !== null && s.lng !== null
          ? { name: { me: s.placeName, en: s.placeName }, lat: s.lat, lng: s.lng }
          : undefined,
      items: [
        {
          id: id++,
          type: s.objectType,
          title: { me: s.objectTitle, en: s.objectTitle },
          creator: s.objectCreator,
          year: s.year,
          collection: 'Digitalna biblioteka',
          imageUrl: makeArt(s.objectType, s.objectTitle, String(s.year)),
          sourceUrl: 'https://dlib.me',
          rights: 'Sample',
        },
      ],
    })),
  }
}

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
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(initial) })
  const { fields, append, remove } = useFieldArray({ control, name: 'sections' })

  const submit = (status: ExhibitionStatus) =>
    handleSubmit((values) =>
      onSubmit(toExhibition(values, authorId, authorName, status, initial?.videos ?? [])),
    )

  const err = (message: string | undefined) =>
    message ? (
      <p role="alert" className="text-sm text-destructive">
        {t('editor.required')}
      </p>
    ) : null

  return (
    <form
      onSubmit={submit(initial?.status === 'published' ? 'published' : 'draft')}
      className="flex flex-col gap-8"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="titleMe">{t('editor.titleMe')}</Label>
          <Input id="titleMe" aria-invalid={Boolean(errors.titleMe)} {...register('titleMe')} />
          {err(errors.titleMe?.message)}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="titleEn">{t('editor.titleEn')}</Label>
          <Input id="titleEn" aria-invalid={Boolean(errors.titleEn)} {...register('titleEn')} />
          {err(errors.titleEn?.message)}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="summaryMe">{t('editor.summaryMe')}</Label>
          <Textarea
            id="summaryMe"
            rows={3}
            aria-invalid={Boolean(errors.summaryMe)}
            {...register('summaryMe')}
          />
          {err(errors.summaryMe?.message)}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="summaryEn">{t('editor.summaryEn')}</Label>
          <Textarea
            id="summaryEn"
            rows={3}
            aria-invalid={Boolean(errors.summaryEn)}
            {...register('summaryEn')}
          />
          {err(errors.summaryEn?.message)}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="template">{t('catalog.template')}</Label>
          <select
            id="template"
            className="h-9 rounded-md border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
            {...register('template')}
          >
            {TEMPLATES.map((tpl) => (
              <option key={tpl} value={tpl}>
                {t(`tpl.${tpl}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="period">{t('editor.period')}</Label>
          <Input
            id="period"
            placeholder="1900 – 1950"
            aria-invalid={Boolean(errors.period)}
            {...register('period')}
          />
          {err(errors.period?.message)}
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="tags">{t('editor.tags')}</Label>
          <Input id="tags" {...register('tags')} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">{t('editor.sections')}</h2>
        {errors.sections?.root && (
          <p role="alert" className="text-sm text-destructive">
            {t('editor.minSections')}
          </p>
        )}
        {fields.map((field, index) => (
          <fieldset key={field.id} className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <legend className="px-2 font-medium">
              {t('editor.section')} {index + 1}
            </legend>
            {(
              [
                ['titleMe', 'editor.sectionTitleMe', 'input'],
                ['titleEn', 'editor.sectionTitleEn', 'input'],
                ['textMe', 'editor.sectionTextMe', 'textarea'],
                ['textEn', 'editor.sectionTextEn', 'textarea'],
              ] as const
            ).map(([name, label, kind]) => {
              const id = `s${index}-${name}`
              return (
                <div key={name} className="flex flex-col gap-2">
                  <Label htmlFor={id}>{t(label)}</Label>
                  {kind === 'input' ? (
                    <Input
                      id={id}
                      aria-invalid={Boolean(errors.sections?.[index]?.[name])}
                      {...register(`sections.${index}.${name}`)}
                    />
                  ) : (
                    <Textarea
                      id={id}
                      rows={3}
                      aria-invalid={Boolean(errors.sections?.[index]?.[name])}
                      {...register(`sections.${index}.${name}`)}
                    />
                  )}
                  {err(errors.sections?.[index]?.[name]?.message)}
                </div>
              )
            })}
            <div className="flex flex-col gap-2">
              <Label htmlFor={`s${index}-year`}>{t('editor.year')}</Label>
              <Input
                id={`s${index}-year`}
                type="number"
                {...register(`sections.${index}.year`, { valueAsNumber: true })}
              />
              {errors.sections?.[index]?.year && (
                <p role="alert" className="text-sm text-destructive">
                  {t('editor.yearRange')}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`s${index}-ot`}>{t('editor.objectType')}</Label>
              <select
                id={`s${index}-ot`}
                className="h-9 rounded-md border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
                {...register(`sections.${index}.objectType`)}
              >
                {ITEM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`type.${type}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`s${index}-obt`}>{t('editor.objectTitle')}</Label>
              <Input
                id={`s${index}-obt`}
                aria-invalid={Boolean(errors.sections?.[index]?.objectTitle)}
                {...register(`sections.${index}.objectTitle`)}
              />
              {err(errors.sections?.[index]?.objectTitle?.message)}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`s${index}-obc`}>{t('editor.objectCreator')}</Label>
              <Input
                id={`s${index}-obc`}
                aria-invalid={Boolean(errors.sections?.[index]?.objectCreator)}
                {...register(`sections.${index}.objectCreator`)}
              />
              {err(errors.sections?.[index]?.objectCreator?.message)}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`s${index}-pn`}>{t('editor.placeName')}</Label>
              <Input id={`s${index}-pn`} {...register(`sections.${index}.placeName`)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`s${index}-lat`}>{t('editor.lat')}</Label>
                <Input
                  id={`s${index}-lat`}
                  type="number"
                  step="any"
                  {...register(`sections.${index}.lat`, {
                    setValueAs: (v: string) => (v === '' || v === null ? null : Number(v)),
                  })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`s${index}-lng`}>{t('editor.lng')}</Label>
                <Input
                  id={`s${index}-lng`}
                  type="number"
                  step="any"
                  {...register(`sections.${index}.lng`, {
                    setValueAs: (v: string) => (v === '' || v === null ? null : Number(v)),
                  })}
                />
              </div>
            </div>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 />
                {t('editor.removeSection')}
              </Button>
            )}
          </fieldset>
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
  )
}
