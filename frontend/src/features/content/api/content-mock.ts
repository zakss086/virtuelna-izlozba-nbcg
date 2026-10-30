import type { Localized } from '@/lib/i18n'
import { NotFoundError, delay } from '@/lib/mock-db'

import type { ContentBlock } from '../types'

// In memory, like the other mocks: edited texts last until the page is reloaded.
let blocks: ContentBlock[] = []

export const mockContentApi = {
  list: () => delay(blocks),

  save: (key: string, value: Localized) => {
    const block: ContentBlock = { key, value, updatedAt: new Date().toISOString() }
    blocks = [...blocks.filter((b) => b.key !== key), block]
    return delay(block)
  },

  reset: (key: string) => {
    if (!blocks.some((b) => b.key === key)) return Promise.reject(new NotFoundError('Content block', 0))
    blocks = blocks.filter((b) => b.key !== key)
    return delay(undefined)
  },
}
