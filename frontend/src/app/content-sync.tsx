import { useEffect } from 'react'

import { useContentBlocks } from '@/features/content/api/use-content'
import { contentOverrides } from '@/lib/content-overrides'

// Puts the texts an admin edited into the store that `t()` reads, so every page shows them.
export function ContentSync() {
  const { data } = useContentBlocks()

  useEffect(() => {
    if (data) contentOverrides.set(Object.fromEntries(data.map((block) => [block.key, block.value])))
  }, [data])

  return null
}
