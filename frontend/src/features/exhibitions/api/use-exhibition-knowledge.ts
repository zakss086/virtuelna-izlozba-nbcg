import { useMemo } from 'react'

import { useI18n } from '@/lib/i18n'
import type { KnowledgeDoc } from '@/lib/knowledge'

import { useExhibitions } from './use-exhibitions'

const NO_DOCS: KnowledgeDoc[] = []

// Published exhibitions and their objects as searchable text for the demo assistant.
export function useExhibitionKnowledge() {
  const { t, l } = useI18n()
  const { data } = useExhibitions({ status: 'published' })

  return useMemo(() => {
    if (!data) return NO_DOCS
    return data.flatMap((exhibition): KnowledgeDoc[] => {
      const href = `/exhibitions/${exhibition.slug}`
      const sectionText = exhibition.sections.map((section) => `${l(section.title)}. ${l(section.text)}`).join(' ')
      const exhibitionDoc: KnowledgeDoc = {
        id: `exhibition-${exhibition.id}`,
        kind: 'exhibition',
        title: l(exhibition.title),
        text: `${l(exhibition.summary)} ${sectionText}`,
        keywords: `${exhibition.tags.join(' ')} ${t(`tpl.${exhibition.template}`)} ${exhibition.period} ${exhibition.authorName}`,
        href,
      }
      const objectDocs = exhibition.sections.flatMap((section) =>
        section.items.map(
          (item): KnowledgeDoc => ({
            id: `object-${item.id}`,
            kind: 'object',
            title: l(item.title),
            text: `${item.creator}. ${item.year ?? ''} ${item.collection}. ${l(exhibition.title)}. ${l(section.title)}.`,
            href,
          }),
        ),
      )
      return [exhibitionDoc, ...objectDocs]
    })
  }, [data, l, t])
}
