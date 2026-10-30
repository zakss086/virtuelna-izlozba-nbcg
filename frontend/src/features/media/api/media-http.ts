import { MAX_PAGE_SIZE, request, withoutNulls, type Page } from '@/lib/http'

import type { MediaAsset, NewMediaAsset } from '../types'

// The backend replaces the mock in `media-mock.ts`: the same functions, so the hooks do not change.
export const httpMediaApi = {
  list: async () =>
    withoutNulls<MediaAsset[]>(
      (await request<Page<MediaAsset>>('GET', '/media', { query: { size: MAX_PAGE_SIZE } })).items,
    ),

  upload: async (input: NewMediaAsset) => {
    const form = new FormData()
    form.set('file', input.file)
    form.set('credit', input.credit)
    form.set('license', input.license)
    form.set('sourceUrl', input.sourceUrl)
    return withoutNulls<MediaAsset>(await request('POST', '/media', { body: form }))
  },

  remove: async (id: number) => {
    await request<undefined>('DELETE', `/media/${id}`)
  },
}
