import { MAX_PAGE_SIZE, request, withoutNulls, type Page } from '@/lib/http'

import type { Library, NewLibrary } from '../types'

const CLEARABLE = ['address', 'website', 'email', 'phone', 'description', 'image', 'location'] as const

// The backend replaces the mock in `libraries-mock.ts`: the same functions, so the hooks do not change.
export const httpLibrariesApi = {
  list: async (): Promise<Library[]> =>
    withoutNulls<Library[]>(
      (await request<Page<Library>>('GET', '/libraries', { query: { size: MAX_PAGE_SIZE } })).items,
    ),

  get: async (id: number): Promise<Library> =>
    withoutNulls<Library>(await request('GET', `/libraries/${id}`)),

  create: async (input: NewLibrary) =>
    withoutNulls<Library>(await request('POST', '/libraries', { body: input })),

  // A field the editor emptied is sent as null, which clears it on the server.
  update: async (id: number, changes: Partial<NewLibrary>) => {
    const body: Record<string, unknown> = { ...changes }
    for (const key of CLEARABLE) if (key in changes && changes[key] === undefined) body[key] = null
    return withoutNulls<Library>(await request('PATCH', `/libraries/${id}`, { body }))
  },

  remove: async (id: number) => {
    await request<undefined>('DELETE', `/libraries/${id}`)
  },
}
