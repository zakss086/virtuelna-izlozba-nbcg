export type MediaKind = 'image' | 'video'

// A picture or video in the media library, with the author and licence shown wherever it is used.
export type MediaAsset = {
  id: number
  /** Where it is served from (`/media/<random>.png` on the backend, a blob URL in the mock). */
  url: string
  filename: string
  contentType: string
  size: number
  credit: string
  license: string
  sourceUrl?: string
  uploadedById?: number
  createdAt: string
}

export type NewMediaAsset = {
  file: File
  credit: string
  license: string
  sourceUrl: string
}

export const kindOf = (asset: Pick<MediaAsset, 'contentType'>): MediaKind =>
  asset.contentType.startsWith('video/') ? 'video' : 'image'
