import { MAX_PAGE_SIZE, request, withoutNulls, type Page } from '@/lib/http'

import type { Exhibition, ExhibitionFilters, ExhibitionStatus, NewExhibition } from '../types'

// The backend takes the same fields as `NewExhibition` except the author, which it reads from the token.
function toBody(input: Partial<NewExhibition>) {
  const { intro } = input
  return {
    title: input.title,
    summary: input.summary,
    // The API wants both languages; a curator may have filled in only one.
    intro:
      intro && (intro.me || intro.en) ? { me: intro.me || intro.en, en: intro.en || intro.me } : undefined,
    coverUrl: input.coverUrl,
    template: input.template,
    status: input.status,
    period: input.period,
    tags: input.tags,
    allowViewSwitch: input.allowViewSwitch,
    sections: input.sections,
    videos: input.videos,
  }
}

const path = (idOrSlug: string | number) => `/exhibitions/${encodeURIComponent(String(idOrSlug))}`

// The API replaces the mock in `exhibitions-mock.ts`: the same functions, so the hooks do not change.
export const httpExhibitionsApi = {
  list: async (filters: ExhibitionFilters = {}) => {
    const page = await request<Page<Exhibition>>('GET', '/exhibitions', {
      query: {
        search: filters.search?.trim(),
        template: filters.template,
        status: filters.status,
        authorId: filters.authorId,
        ids: filters.ids?.join(','),
        size: MAX_PAGE_SIZE,
      },
    })
    return withoutNulls<Exhibition[]>(page.items)
  },

  get: async (idOrSlug: string | number) => withoutNulls<Exhibition>(await request('GET', path(idOrSlug))),

  create: async (input: NewExhibition) =>
    withoutNulls<Exhibition>(await request('POST', '/exhibitions', { body: toBody(input) })),

  update: async (id: number, changes: Partial<NewExhibition>) =>
    withoutNulls<Exhibition>(await request('PATCH', path(id), { body: toBody(changes) })),

  setStatus: async (id: number, status: ExhibitionStatus) =>
    withoutNulls<Exhibition>(await request('PATCH', `${path(id)}/status`, { body: { status } })),

  remove: async (id: number) => {
    await request<undefined>('DELETE', path(id))
  },
}
