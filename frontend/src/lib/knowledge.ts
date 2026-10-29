import { normalizeText } from '@/lib/text'

// A searchable piece of site content (exhibition, object, library, collection or guide) used by the demo assistant.
export type KnowledgeKind = 'exhibition' | 'object' | 'library' | 'collection' | 'guide'

export type KnowledgeDoc = {
  id: string
  kind: KnowledgeKind
  title: string
  text: string
  keywords?: string
  href: string
  external?: boolean
}

export type KnowledgeMatch = { doc: KnowledgeDoc; score: number }

const STOPWORDS = new Set([
  'i', 'u', 'je', 'da', 'li', 'na', 'sa', 'za', 'se', 'o', 'od', 'do', 'ili', 'su', 'ko', 'sto', 'sta',
  'koji', 'koja', 'koje', 'kako', 'gdje', 'kad', 'kada', 'ima', 'imate', 'mi', 'me', 'vi', 'ti', 'ne', 'bi',
  'the', 'a', 'an', 'is', 'are', 'of', 'in', 'on', 'to', 'for', 'and', 'or', 'what', 'how', 'where', 'who',
  'when', 'which', 'about', 'does', 'you', 'your', 'can', 'my', 'tell', 'show', 'there', 'any', 'please',
  'molim', 'zelim', 'zanima', 'recite', 'reci', 'hocu', 'mogu', 'moze', 'li',
])

const STEM_LENGTH = 5

// Stems that appear in almost every document here; they only count when nothing else is left in the question.
const WEAK_STEMS = new Set(['izloz'])

// Words are cut to their first letters, a cheap way to match "izložba", "izložbe" and "izložbi".
export function tokenize(text: string) {
  return normalizeText(text)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 2 && !STOPWORDS.has(word))
    .map((word) => word.slice(0, STEM_LENGTH))
}

// Ranks documents for a question: a hit in the title counts most, then keywords, then the text.
export function searchDocs(query: string, docs: KnowledgeDoc[], limit = 3): KnowledgeMatch[] {
  const all = [...new Set(tokenize(query))]
  const strong = all.filter((term) => !WEAK_STEMS.has(term))
  const terms = strong.length > 0 ? strong : all
  if (terms.length === 0) return []

  const scored = docs.map((doc) => {
    const title = new Set(tokenize(doc.title))
    const keywords = new Set(tokenize(doc.keywords ?? ''))
    const text = new Set(tokenize(doc.text))
    let score = 0
    let hits = 0
    for (const term of terms) {
      const termScore = (title.has(term) ? 4 : 0) + (keywords.has(term) ? 3 : 0) + (text.has(term) ? 1 : 0)
      if (termScore > 0) hits++
      score += termScore
    }
    if (terms.length > 1 && hits === terms.length) score += 2
    return { doc, score }
  })

  return scored
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
