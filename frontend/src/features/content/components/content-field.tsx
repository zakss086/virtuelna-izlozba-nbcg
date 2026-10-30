import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/lib/i18n'
import { messages, type MessageKey } from '@/lib/messages'
import { showToast } from '@/lib/toast'

import { useResetContentBlock, useSaveContentBlock } from '../api/use-content'
import type { ContentBlock } from '../types'

type ContentFieldProps = { messageKey: MessageKey; block: ContentBlock | undefined }

// One editable site text: the text in both languages, save, and back to the default.
export function ContentField({ messageKey, block }: ContentFieldProps) {
  const { t } = useI18n()
  const save = useSaveContentBlock()
  const reset = useResetContentBlock()
  const [me, setMe] = useState(block?.value.me ?? messages.me[messageKey])
  const [en, setEn] = useState(block?.value.en ?? messages.en[messageKey])

  const shownMe = block?.value.me ?? messages.me[messageKey]
  const shownEn = block?.value.en ?? messages.en[messageKey]
  const changed = me !== shownMe || en !== shownEn
  const complete = me.trim() !== '' && en.trim() !== ''
  const busy = save.isPending || reset.isPending

  function onSave() {
    save.mutate(
      { key: messageKey, value: { me: me.trim(), en: en.trim() } },
      {
        onSuccess: () => showToast('success', t('cms.saved')),
        onError: () => showToast('error', t('cms.saveError')),
      },
    )
  }

  function onReset() {
    reset.mutate(messageKey, {
      onSuccess: () => {
        setMe(messages.me[messageKey])
        setEn(messages.en[messageKey])
        showToast('success', t('cms.resetDone'))
      },
      onError: () => showToast('error', t('cms.saveError')),
    })
  }

  return (
    <li className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <code className="text-sm text-muted-foreground">{messageKey}</code>
        {block && <Badge variant="accent">{t('cms.edited')}</Badge>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${messageKey}-me`}>{t('cms.me')}</Label>
          <Textarea
            id={`${messageKey}-me`}
            rows={4}
            value={me}
            onChange={(event) => setMe(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${messageKey}-en`}>{t('cms.en')}</Label>
          <Textarea
            id={`${messageKey}-en`}
            rows={4}
            value={en}
            onChange={(event) => setEn(event.target.value)}
          />
        </div>
      </div>
      {!complete && <p className="text-sm text-destructive">{t('cms.bothLanguages')}</p>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onSave} disabled={!changed || !complete || busy}>
          {t('cms.save')}
        </Button>
        {block && (
          <Button variant="outline" onClick={onReset} disabled={busy}>
            {t('cms.reset')}
          </Button>
        )}
      </div>
    </li>
  )
}
