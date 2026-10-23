import { NotFoundError, delay } from '@/lib/mock-db'

import type { Exhibition, ExhibitionFilters, ExhibitionStatus, NewExhibition } from '../types'
import { initialExhibitions } from './exhibitions-data'

let exhibitions: Exhibition[] = initialExhibitions

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'dj')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function matches(exhibition: Exhibition, filters: ExhibitionFilters) {
  if (filters.template && exhibition.template !== filters.template) return false
  if (filters.status && exhibition.status !== filters.status) return false
  if (filters.authorId && exhibition.authorId !== filters.authorId) return false
  if (filters.ids && !filters.ids.includes(exhibition.id)) return false
  const q = filters.search?.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    exhibition.title.me,
    exhibition.title.en,
    exhibition.summary.me,
    exhibition.summary.en,
    ...exhibition.tags,
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export const exhibitionsApi = {
  list: (filters: ExhibitionFilters = {}) =>
    delay(
      exhibitions.filter((e) => matches(e, filters)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),

  get: (idOrSlug: string | number) => {
    const found = exhibitions.find((e) => e.slug === idOrSlug || e.id === Number(idOrSlug))
    if (!found) return Promise.reject(new NotFoundError('Exhibition', Number(idOrSlug) || 0))
    return delay(found)
  },

  create: (input: NewExhibition) => {
    const id = Date.now()
    const exhibition: Exhibition = {
      ...input,
      id,
      slug: `${slugify(input.title.en || input.title.me)}-${id.toString(36)}`,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    exhibitions = [exhibition, ...exhibitions]
    return delay(exhibition)
  },

  update: (id: number, changes: Partial<NewExhibition>) => {
    exhibitions = exhibitions.map((e) => (e.id === id ? { ...e, ...changes } : e))
    return exhibitionsApi.get(id)
  },

  setStatus: (id: number, status: ExhibitionStatus) => exhibitionsApi.update(id, { status }),

  remove: (id: number) => {
    exhibitions = exhibitions.filter((e) => e.id !== id)
    return delay(undefined)
  },
}
