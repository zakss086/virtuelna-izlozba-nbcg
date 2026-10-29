import { CircleAlert, CircleCheck } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n'

import { runChecks, suggestTags } from './exhibition-checks'
import type { FormValues } from './exhibition-form-model'

// Helper panel in the editor: a checklist for the draft and tag suggestions. It follows what the curator types.
export function EditorAssistant() {
  const { t } = useI18n()
  const { control, getValues, setValue } = useFormContext<FormValues>()
  useWatch({ control }) // re-render on every change in the form
  const values = getValues()

  const started = values.titleMe.trim() !== '' || values.summaryMe.trim() !== ''
  const results = started ? runChecks(values) : []
  const suggestions = started ? suggestTags(values) : []

  function addTag(tag: string) {
    const current = values.tags.split(',').map((item) => item.trim()).filter(Boolean)
    setValue('tags', [...current, tag].join(', '), { shouldDirty: true })
  }

  return (
    <aside aria-labelledby="editor-assistant" className="flex flex-col gap-4 rounded-lg border bg-secondary p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="editor-assistant" className="font-heading text-xl font-semibold">
          {t('check.title')}
        </h2>
        <Badge variant="accent">{t('assistant.badge')}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{t('check.note')}</p>

      {!started ? (
        <p className="text-sm text-muted-foreground">{t('check.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm" aria-live="polite">
          {results.map((result) => (
            <li key={result.key} className="flex items-start gap-2">
              {result.ok ? (
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              ) : (
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              )}
              <span>{t(result.key, result.vars)}</span>
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{t('check.suggested')}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="rounded-full border bg-background px-3 py-1 text-sm hover:border-accent focus-visible:outline-2 focus-visible:outline-ring"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
