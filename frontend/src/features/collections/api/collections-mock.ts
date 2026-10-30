import { delay, NotFoundError } from '@/lib/mock-db'

import type { Collection, NewCollection } from '../types'
import { initialCollections } from './collections-data'

// In memory, like the other mocks: changes last until the page is reloaded.
let collections: Collection[] = initialCollections
let nextId = Math.max(0, ...initialCollections.map((c) => c.id)) + 1

const ordered = (list: Collection[]) => [...list].sort((a, b) => a.position - b.position || a.id - b.id)

export const mockCollectionsApi = {
  list: () => delay(ordered(collections)),

  create: (input: NewCollection) => {
    const collection: Collection = { ...input, id: nextId++ }
    collections = [...collections, collection]
    return delay(collection)
  },

  update: (id: number, changes: Partial<NewCollection>) => {
    const found = collections.find((c) => c.id === id)
    if (!found) return Promise.reject(new NotFoundError('Collection', id))
    const updated = { ...found, ...changes }
    collections = collections.map((c) => (c.id === id ? updated : c))
    return delay(updated)
  },

  remove: (id: number) => {
    if (!collections.some((c) => c.id === id)) return Promise.reject(new NotFoundError('Collection', id))
    collections = collections.filter((c) => c.id !== id)
    return delay(undefined)
  },
}
