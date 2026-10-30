import type { Localized } from '@/lib/i18n'
import { MAX_PAGE_SIZE, request, withoutNulls, type Page } from '@/lib/http'

import type { ContentBlock } from '../types'

const path = (key: string) => `/content/${encodeURIComponent(key)}`

// The backend replaces the mock in `content-mock.ts`: the same functions, so the hooks do not change.
export const httpContentApi = {
  list: async () =>
    withoutNulls<ContentBlock[]>(
      (await request<Page<ContentBlock>>('GET', '/content', { query: { size: MAX_PAGE_SIZE } })).items,
    ),

  save: async (key: string, value: Localized) =>
    withoutNulls<ContentBlock>(await request('PUT', path(key), { body: { value } })),

  reset: async (key: string) => {
    await request<undefined>('DELETE', path(key))
  },
}
