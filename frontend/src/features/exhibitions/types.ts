import type { ArtKind } from '@/lib/art'
import type { Localized } from '@/lib/i18n'

export type ExhibitionTemplate = 'timeline' | 'gallery' | 'map' | 'slider' | 'room'
export type ExhibitionStatus = 'draft' | 'pending' | 'published'
export type ItemType = ArtKind

export const TEMPLATES: ExhibitionTemplate[] = ['timeline', 'gallery', 'map', 'slider', 'room']
export const ITEM_TYPES: ItemType[] = ['book', 'manuscript', 'map', 'photo', 'periodical', 'poster', 'audio']

// A digitized object (book, map, photo...) shown inside an exhibition.
export type ExhibitionItem = {
  id: number
  type: ItemType
  title: Localized
  creator: string
  year?: number
  collection: string
  imageUrl: string
  sourceUrl: string
  rights: string
}

export type Place = {
  name: Localized
  lat: number
  lng: number
}

export type Section = {
  id: number
  title: Localized
  text: Localized
  year?: number
  place?: Place
  items: ExhibitionItem[]
}

export type Exhibition = {
  id: number
  slug: string
  title: Localized
  summary: Localized
  coverUrl: string
  template: ExhibitionTemplate
  status: ExhibitionStatus
  period: string
  tags: string[]
  authorId: number
  authorName: string
  sections: Section[]
  videos: ExhibitionVideo[]
  createdAt: string
}

export type NewExhibition = Omit<Exhibition, 'id' | 'slug' | 'createdAt' | 'authorName'> & {
  authorName: string
}

export type ExhibitionFilters = {
  search?: string
  template?: ExhibitionTemplate
  status?: ExhibitionStatus
  authorId?: number
  ids?: number[]
}

// A video shown in an exhibition and in the video gallery.
export type ExhibitionVideo = {
  id: number
  title: Localized
  description: Localized
  src: string
  credit: string
  license: string
  sourceUrl: string
}
