import { searchDocs, type KnowledgeDoc } from '@/lib/knowledge'
import { normalizeText } from '@/lib/text'

import type { AssistantReply } from '../types'
import { guides } from './guides'

// The demo assistant does not call any AI service. It looks the question up in the site content that the
// caller passes in (exhibitions, objects, libraries, collections) and in the ready-made guides, then answers
// after a short pause so it feels like a conversation. When the backend exists this is the place to call a real model.

const THINKING_MS = 700
const GUIDE_MIN_SCORE = 6
const MATCH_MIN_SCORE = 3

const GREETING = /^(zdravo|pozdrav|cao|dobar|dobro|hej|hello|hi|hey|good)\b/
const HELP = /\b(pomoc|pomozi|help|sta (mozes|umijes|znas)|what can you)\b/

const guideDocs: KnowledgeDoc[] = guides.map((guide) => ({
  id: guide.id,
  kind: 'guide',
  title: `${guide.question.me} ${guide.question.en}`,
  text: `${guide.answer.me} ${guide.answer.en}`,
  keywords: guide.keywords,
  href: guide.href ?? '',
}))

function answer(question: string, docs: KnowledgeDoc[]): AssistantReply {
  const normalized = normalizeText(question.trim())
  if (GREETING.test(normalized)) return { type: 'greeting' }
  if (HELP.test(normalized)) return { type: 'help' }

  const guideBest = searchDocs(question, guideDocs, 1)[0]
  const docMatches = searchDocs(question, docs, 3).filter((match) => match.score >= MATCH_MIN_SCORE)
  const docBest = docMatches[0]

  const guideWins = guideBest && guideBest.score >= GUIDE_MIN_SCORE && guideBest.score >= (docBest?.score ?? 0)
  const guide = guideWins ? guides.find((item) => item.id === guideBest.doc.id) : undefined
  if (guide) return { type: 'guide', guide, related: docMatches.slice(0, 2).map((match) => match.doc) }

  if (docBest) return { type: 'matches', matches: docMatches }

  const weakGuide = guideBest && guideBest.score >= MATCH_MIN_SCORE ? guides.find((item) => item.id === guideBest.doc.id) : undefined
  if (weakGuide) return { type: 'guide', guide: weakGuide, related: [] }

  return { type: 'none' }
}

export const assistantApi = {
  ask: (question: string, docs: KnowledgeDoc[]): Promise<AssistantReply> =>
    new Promise((resolve) => setTimeout(() => resolve(answer(question, docs)), THINKING_MS)),
}
