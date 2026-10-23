import { Trash2 } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/lib/i18n'

import { ITEM_TYPES } from '../types'
import type { FormValues } from './exhibition-form-model'
import { FieldError } from './field-error'

type SectionFieldsProps = {
  index: number
  onRemove?: () => void
}

const parseCoordinate = (value: string | null) => (value === '' || value === null ? null : Number(value))

// One section of the exhibition form: texts, year, optional place and one object.
export function SectionFields({ index, onRemove }: SectionFieldsProps) {
  const { t } = useI18n()
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormValues>()
  const sectionErrors = errors.sections?.[index]

  return (
    <fieldset className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
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
                aria-invalid={Boolean(sectionErrors?.[name])}
                {...register(`sections.${index}.${name}`)}
              />
            ) : (
              <Textarea
                id={id}
                rows={3}
                aria-invalid={Boolean(sectionErrors?.[name])}
                {...register(`sections.${index}.${name}`)}
              />
            )}
            <FieldError message={sectionErrors?.[name]?.message} />
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
        <FieldError message={sectionErrors?.year?.message} messageKey="editor.yearRange" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`s${index}-ot`}>{t('editor.objectType')}</Label>
        <Controller
          control={control}
          name={`sections.${index}.objectType`}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`s${index}-ot`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`type.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`s${index}-obt`}>{t('editor.objectTitle')}</Label>
        <Input
          id={`s${index}-obt`}
          aria-invalid={Boolean(sectionErrors?.objectTitle)}
          {...register(`sections.${index}.objectTitle`)}
        />
        <FieldError message={sectionErrors?.objectTitle?.message} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`s${index}-obc`}>{t('editor.objectCreator')}</Label>
        <Input
          id={`s${index}-obc`}
          aria-invalid={Boolean(sectionErrors?.objectCreator)}
          {...register(`sections.${index}.objectCreator`)}
        />
        <FieldError message={sectionErrors?.objectCreator?.message} />
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
            {...register(`sections.${index}.lat`, { setValueAs: parseCoordinate })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`s${index}-lng`}>{t('editor.lng')}</Label>
          <Input
            id={`s${index}-lng`}
            type="number"
            step="any"
            {...register(`sections.${index}.lng`, { setValueAs: parseCoordinate })}
          />
        </div>
      </div>
      {onRemove && (
        <Button type="button" variant="ghost" size="sm" className="w-fit text-destructive" onClick={onRemove}>
          <Trash2 />
          {t('editor.removeSection')}
        </Button>
      )}
    </fieldset>
  )
}
