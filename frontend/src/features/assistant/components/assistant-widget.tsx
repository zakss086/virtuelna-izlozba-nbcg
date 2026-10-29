import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import type { KnowledgeDoc } from '@/lib/knowledge'
import { showToast } from '@/lib/toast'

import { useAskAssistant } from '../api/use-assistant'
import type { ChatEntry } from '../types'
import { AssistantChat } from './assistant-chat'

type AssistantWidgetProps = {
  /** Site content the assistant may search; the layout collects it from the features. */
  docs: KnowledgeDoc[]
}

// Floating button that opens the demo assistant. The conversation stays while the visitor moves between pages.
export function AssistantWidget({ docs }: AssistantWidgetProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<ChatEntry[]>([])
  const ask = useAskAssistant()

  function send(question: string) {
    const text = question.trim()
    if (!text || ask.isPending) return
    setEntries((current) => [...current, { id: Date.now(), role: 'user', text }])
    ask.mutate(
      { question: text, docs },
      {
        onSuccess: (reply) =>
          setEntries((current) => [...current, { id: Date.now() + 1, role: 'assistant', reply }]),
        onError: () => showToast('error', t('assistant.error')),
      },
    )
  }

  return (
    <>
      {open && (
        <AssistantChat entries={entries} pending={ask.isPending} onSend={send} onClose={() => setOpen(false)} />
      )}
      <Button
        type="button"
        size="lg"
        className="fixed right-4 bottom-4 z-40 rounded-full shadow-lg"
        aria-expanded={open}
        aria-label={t('assistant.open')}
        onClick={() => setOpen((value) => !value)}
      >
        <MessageCircle />
        <span className="hidden sm:inline">{t('assistant.ask')}</span>
      </Button>
    </>
  )
}
