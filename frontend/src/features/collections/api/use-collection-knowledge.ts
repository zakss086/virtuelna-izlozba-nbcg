import { useMemo } from 'react'

import { useI18n } from '@/lib/i18n'
import type { KnowledgeDoc } from '@/lib/knowledge'

import { useCollections } from './use-collections'

const NO_DOCS: KnowledgeDoc[] = []

// Collections of the digital library as searchable text for the demo assistant.
export function useCollectionKnowledge() {
  const { l } = useI18n()
  const { data } = useCollections()

  return useMemo(() => {
    if (!data) return NO_DOCS
    return data.map(
      (collection, index): KnowledgeDoc => ({
        id: `collection-${index}`,
        kind: 'collection',
        title: l(collection.name),
        text: l(collection.text),
        href: collection.href,
        external: true,
      }),
    )
  }, [data, l])
}
