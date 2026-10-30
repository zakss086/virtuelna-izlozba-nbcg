import { MAX_PAGE_SIZE, request, withoutNulls, type Page } from '@/lib/http'

import type { Collection, NewCollection } from '../types'

// The backend replaces the mock in `collections-mock.ts`: the same functions, so the hooks do not change.
export const httpCollectionsApi = {
  list: async () =>
    withoutNulls<Collection[]>(
      (await request<Page<Collection>>('GET', '/collections', { query: { size: MAX_PAGE_SIZE } })).items,
    ),

  create: async (input: NewCollection) =>
    withoutNulls<Collection>(await request('POST', '/collections', { body: input })),

  update: async (id: number, changes: Partial<NewCollection>) =>
    withoutNulls<Collection>(await request('PATCH', `/collections/${id}`, { body: changes })),

  remove: async (id: number) => {
    await request<undefined>('DELETE', `/collections/${id}`)
  },
}
