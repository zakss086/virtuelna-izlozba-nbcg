import { useMemo } from 'react'

import { useI18n } from '@/lib/i18n'
import type { KnowledgeDoc } from '@/lib/knowledge'

import { useLibraries } from './use-libraries'

const NO_DOCS: KnowledgeDoc[] = []

// Libraries as searchable text for the demo assistant; each answer links to the library on the map.
export function useLibraryKnowledge() {
  const { t, l } = useI18n()
  const { data } = useLibraries()

  return useMemo(() => {
    if (!data) return NO_DOCS
    return data.map(
      (library): KnowledgeDoc => ({
        id: `library-${library.id}`,
        kind: 'library',
        title: library.name,
        text: [
          `${t(`libraries.type.${library.type}`)}, ${library.city}.`,
          library.address ?? '',
          library.phone ?? '',
          library.email ?? '',
          library.description ? l(library.description) : '',
        ].join(' '),
        keywords: `${library.city} ${t('libraries.keywords')}`,
        href: `/map?library=${library.id}`,
      }),
    )
  }, [data, l, t])
}
