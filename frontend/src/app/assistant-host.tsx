import { useMemo } from 'react'

import { AssistantWidget } from '@/features/assistant/components/assistant-widget'
import { useCollectionKnowledge } from '@/features/collections/api/use-collection-knowledge'
import { useExhibitionKnowledge } from '@/features/exhibitions/api/use-exhibition-knowledge'
import { useLibraryKnowledge } from '@/features/libraries/api/use-library-knowledge'

// Collects what the assistant may talk about from the features and hands it over, so features stay independent.
export function AssistantHost() {
  const exhibitions = useExhibitionKnowledge()
  const libraries = useLibraryKnowledge()
  const collections = useCollectionKnowledge()
  const docs = useMemo(() => [...exhibitions, ...libraries, ...collections], [exhibitions, libraries, collections])

  return <AssistantWidget docs={docs} />
}
