import type { MessageKey } from '@/lib/messages'
import { normalizeText } from '@/lib/text'

import type { FormValues } from './exhibition-form-model'

// Simple, explainable checks for the curator's draft. No AI service is involved and nothing leaves the browser.

export type CheckResult = {
  ok: boolean
  /** Message to show; the "ok" and "fail" variants are separate keys. */
  key: MessageKey
  vars?: Record<string, string | number>
}

const MIN_SUMMARY = 60
const MIN_TAGS = 3
const MIN_SECTIONS = 3
const MIN_SECTION_TEXT = 80
const MAX_SUGGESTIONS = 6

const joinIndexes = (indexes: number[]) => indexes.map((index) => index + 1).join(', ')

export function runChecks(values: FormValues): CheckResult[] {
  const results: CheckResult[] = []

  const translated =
    values.titleEn.trim() !== '' &&
    values.summaryEn.trim() !== '' &&
    normalizeText(values.titleEn.trim()) !== normalizeText(values.titleMe.trim())
  results.push({ ok: translated, key: translated ? 'check.translation.ok' : 'check.translation.fail' })

  const summaryOk = values.summaryMe.trim().length >= MIN_SUMMARY
  results.push({ ok: summaryOk, key: summaryOk ? 'check.summary.ok' : 'check.summary.fail' })

  const tagCount = values.tags.split(',').filter((tag) => tag.trim() !== '').length
  const tagsOk = tagCount >= MIN_TAGS
  results.push({ ok: tagsOk, key: tagsOk ? 'check.tags.ok' : 'check.tags.fail' })

  const sectionsOk = values.sections.length >= MIN_SECTIONS
  results.push({
    ok: sectionsOk,
    key: sectionsOk ? 'check.sections.ok' : 'check.sections.fail',
    vars: { count: values.sections.length },
  })

  const shortText = values.sections.flatMap((section, index) =>
    section.textMe.trim().length < MIN_SECTION_TEXT || section.textEn.trim().length < MIN_SECTION_TEXT ? [index] : [],
  )
  results.push(
    shortText.length === 0
      ? { ok: true, key: 'check.text.ok' }
      : { ok: false, key: 'check.text.fail', vars: { list: joinIndexes(shortText) } },
  )

  if (values.template === 'map') {
    const withoutPlace = values.sections.flatMap((section, index) =>
      section.placeName.trim() === '' || section.lat === null || section.lng === null ? [index] : [],
    )
    results.push(
      withoutPlace.length === 0
        ? { ok: true, key: 'check.places.ok' }
        : { ok: false, key: 'check.places.fail', vars: { list: joinIndexes(withoutPlace) } },
    )
  }

  if (values.template === 'timeline') {
    const ordered = values.sections.every((section, index) => index === 0 || section.year >= (values.sections[index - 1]?.year ?? 0))
    results.push({ ok: ordered, key: ordered ? 'check.order.ok' : 'check.order.fail' })
  }

  return results
}

// Frequent words and proper names from the texts that are not tags yet, offered as tag suggestions.
export function suggestTags(values: FormValues): string[] {
  const text = [values.titleMe, values.summaryMe, ...values.sections.flatMap((s) => [s.titleMe, s.textMe, s.objectTitle])].join(' ')
  const existing = new Set(values.tags.split(',').map((tag) => normalizeText(tag.trim())))

  const counts = new Map<string, { word: string; score: number }>()
  for (const raw of text.split(/[^\p{L}]+/u)) {
    if (raw.length < 5) continue
    const key = normalizeText(raw).slice(0, 5)
    const properName = raw[0] !== raw[0]?.toLocaleLowerCase()
    const entry = counts.get(key) ?? { word: raw.toLocaleLowerCase(), score: 0 }
    entry.score += properName ? 2 : 1
    if (properName) entry.word = raw
    counts.set(key, entry)
  }

  return [...counts.values()]
    .filter((entry) => entry.score >= 2 && !existing.has(normalizeText(entry.word)))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .map((entry) => entry.word)
}
