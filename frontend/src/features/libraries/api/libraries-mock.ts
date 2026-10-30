import { delay, NotFoundError } from '@/lib/mock-db'

import type { Library, NewLibrary } from '../types'
import { libraries as initialLibraries } from './libraries-data'

// In memory, like the other mocks: changes last until the page is reloaded.
let libraries: Library[] = initialLibraries
let nextId = Math.max(0, ...initialLibraries.map((l) => l.id)) + 1

export const mockLibrariesApi = {
  list: (): Promise<Library[]> => delay([...libraries]),

  get: async (id: number): Promise<Library> => {
    const library = libraries.find((item) => item.id === id)
    if (!library) throw new NotFoundError('Library', id)
    return delay(library)
  },

  create: (input: NewLibrary) => {
    const library: Library = { ...input, id: nextId++ }
    libraries = [...libraries, library]
    return delay(library)
  },

  update: (id: number, changes: Partial<NewLibrary>) => {
    const found = libraries.find((l) => l.id === id)
    if (!found) return Promise.reject(new NotFoundError('Library', id))
    const updated = { ...found, ...changes }
    libraries = libraries.map((l) => (l.id === id ? updated : l))
    return delay(updated)
  },

  remove: (id: number) => {
    if (!libraries.some((l) => l.id === id)) return Promise.reject(new NotFoundError('Library', id))
    libraries = libraries.filter((l) => l.id !== id)
    return delay(undefined)
  },
}
