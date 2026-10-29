import type { Localized } from '@/lib/i18n'
import type { KnowledgeDoc, KnowledgeMatch } from '@/lib/knowledge'

// A ready-made answer about how to use the site.
export type Guide = {
  id: string
  question: Localized
  /** Extra words that should lead to this guide, in both languages. */
  keywords: string
  answer: Localized
  /** Internal route that helps with the task. */
  href?: string
}

// What the demo assistant found. The wording is built in the UI, so it follows the current language.
export type AssistantReply =
  | { type: 'greeting' }
  | { type: 'help' }
  | { type: 'guide'; guide: Guide; related: KnowledgeDoc[] }
  | { type: 'matches'; matches: KnowledgeMatch[] }
  | { type: 'none' }

export type ChatEntry =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'assistant'; reply: AssistantReply }
