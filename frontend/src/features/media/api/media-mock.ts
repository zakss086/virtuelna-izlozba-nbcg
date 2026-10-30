import { NotFoundError, delay } from '@/lib/mock-db'

import type { MediaAsset, NewMediaAsset } from '../types'

// In memory, like the other mocks: an uploaded file lives as a blob URL until the page is reloaded.
let assets: MediaAsset[] = []
let nextId = 1

export const mockMediaApi = {
  list: () => delay([...assets].reverse()),

  upload: (input: NewMediaAsset) => {
    const asset: MediaAsset = {
      id: nextId++,
      url: URL.createObjectURL(input.file),
      filename: input.file.name,
      contentType: input.file.type,
      size: input.file.size,
      credit: input.credit,
      license: input.license,
      sourceUrl: input.sourceUrl || undefined,
      createdAt: new Date().toISOString(),
    }
    assets = [...assets, asset]
    return delay(asset)
  },

  remove: (id: number) => {
    const asset = assets.find((a) => a.id === id)
    if (!asset) return Promise.reject(new NotFoundError('Media', id))
    URL.revokeObjectURL(asset.url)
    assets = assets.filter((a) => a.id !== id)
    return delay(undefined)
  },
}
