import { delay } from '@/lib/mock-db'

import type { AuditEntityType, AuditEntry, AuditPage } from '../types'

const PAGE_SIZE = 25
const HOUR = 3_600_000

function ago(hours: number) {
  return new Date(Date.now() - hours * HOUR).toISOString()
}

// `pnpm dev` does not record changes (each feature has its own in-memory data), so the page shows a fixed sample.
// With the backend (`pnpm dev:api`) every real change is listed.
const entries: AuditEntry[] = [
  {
    id: 8,
    createdAt: ago(1),
    actorName: 'Jelena Đurović',
    action: 'update',
    entityType: 'exhibition',
    entityRef: '3',
    label: 'Crna Gora u krugu',
    detail: 'status=pending>published',
  },
  {
    id: 7,
    createdAt: ago(3),
    actorName: 'Marko Vuković',
    action: 'update',
    entityType: 'exhibition',
    entityRef: '3',
    label: 'Crna Gora u krugu',
    detail: 'status=draft>pending',
  },
  {
    id: 6,
    createdAt: ago(5),
    actorName: 'Jelena Đurović',
    action: 'update',
    entityType: 'content',
    entityRef: 'about.lead',
    label: 'about.lead',
  },
  {
    id: 5,
    createdAt: ago(9),
    actorName: 'Jelena Đurović',
    action: 'create',
    entityType: 'user',
    entityRef: '5',
    label: 'Nikola Radović <nikola@nb-cg.me>',
    detail: 'role=curator',
  },
  {
    id: 4,
    createdAt: ago(26),
    actorName: 'Jelena Đurović',
    action: 'update',
    entityType: 'library',
    entityRef: '12',
    label: 'Narodna biblioteka Budva',
    detail: 'location, website',
  },
  {
    id: 3,
    createdAt: ago(30),
    actorName: 'Marko Vuković',
    action: 'create',
    entityType: 'media',
    entityRef: '2',
    label: 'oktoih.jpg',
    detail: 'type=image/jpeg, size=482113',
  },
  {
    id: 2,
    createdAt: ago(50),
    actorName: 'Jelena Đurović',
    action: 'delete',
    entityType: 'collection',
    entityRef: '9',
    label: 'Stari dokumenti',
  },
  {
    id: 1,
    createdAt: ago(72),
    actorName: 'Jelena Đurović',
    action: 'update',
    entityType: 'user',
    entityRef: '5',
    label: 'Nikola Radović <nikola@nb-cg.me>',
    detail: 'switched_off, new_password',
  },
]

export const mockAuditApi = {
  list: async (entityType: AuditEntityType | undefined, page: number): Promise<AuditPage> => {
    const matching = entries.filter((e) => !entityType || e.entityType === entityType)
    const start = (page - 1) * PAGE_SIZE
    return delay({
      items: matching.slice(start, start + PAGE_SIZE),
      total: matching.length,
      pages: Math.max(1, Math.ceil(matching.length / PAGE_SIZE)),
    })
  },
}
