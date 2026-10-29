import { Send, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'

import type { ChatEntry } from '../types'
import { ChatMessage } from './chat-message'

type AssistantChatProps = {
  entries: ChatEntry[]
  pending: boolean
  onSend: (question: string) => void
  onClose: () => void
}

const SUGGESTIONS = ['assistant.suggest.1', 'assistant.suggest.2', 'assistant.suggest.3', 'assistant.suggest.4'] as const

// The chat window: a note that this is a demo, the conversation, suggested questions and the input.
export function AssistantChat({ entries, pending, onSend, onClose }: AssistantChatProps) {
  const { t } = useI18n()
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [entries, pending])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim() || pending) return
    onSend(draft)
    setDraft('')
  }

  return (
    <section
      role="dialog"
      aria-label={t('assistant.title')}
      className="fixed right-4 bottom-20 z-40 flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border bg-card shadow-xl"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
    >
      <header className="flex items-center justify-between gap-2 bg-ink px-4 py-3 text-on-ink">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-lg font-semibold">{t('assistant.title')}</h2>
          <Badge variant="accent">{t('assistant.badge')}</Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:bg-on-ink/10"
          aria-label={t('viewer.close')}
          onClick={onClose}
        >
          <X />
        </Button>
      </header>

      <p className="border-b px-4 py-2 text-xs text-muted-foreground">{t('assistant.note')}</p>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" role="log" aria-live="polite">
        <div className="mr-4 self-start rounded-lg bg-secondary px-3 py-2 text-sm">{t('assistant.welcome')}</div>
        {entries.map((entry) => (
          <ChatMessage key={entry.id} entry={entry} />
        ))}
        {pending && (
          <p className="self-start text-sm text-muted-foreground" role="status">
            {t('assistant.typing')}
          </p>
        )}
        {entries.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onSend(t(key))}
                className="rounded-full border px-3 py-1 text-left text-xs hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                {t(key)}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t p-3">
        <Label htmlFor="assistant-input" className="sr-only">
          {t('assistant.placeholder')}
        </Label>
        <Input
          id="assistant-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t('assistant.placeholder')}
          autoComplete="off"
          autoFocus
        />
        <Button type="submit" size="icon" disabled={pending || !draft.trim()} aria-label={t('assistant.send')}>
          <Send />
        </Button>
      </form>
    </section>
  )
}
