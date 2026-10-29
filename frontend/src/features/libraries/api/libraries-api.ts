import { delay, NotFoundError } from '@/lib/mock-db'

import type { Library } from '../types'
import { libraries } from './libraries-data'

// Read-only mock until the backend serves GET /libraries and GET /libraries/:id (see docs/entities.md).
export const librariesApi = {
  list: (): Promise<Library[]> => delay([...libraries]),

  get: async (id: number): Promise<Library> => {
    const library = libraries.find((item) => item.id === id)
    if (!library) throw new NotFoundError('Library', id)
    return delay(library)
  },
}
