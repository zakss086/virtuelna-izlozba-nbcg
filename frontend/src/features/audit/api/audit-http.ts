import { request, withoutNulls, type Page } from '@/lib/http'

import type { AuditEntityType, AuditEntry, AuditPage } from '../types'

export const AUDIT_PAGE_SIZE = 25

// Admin only: the backend answers 403 to anyone else.
export const httpAuditApi = {
  list: async (entityType: AuditEntityType | undefined, page: number): Promise<AuditPage> => {
    const result = await request<Page<AuditEntry>>('GET', '/audit', {
      query: { entityType, page, size: AUDIT_PAGE_SIZE },
    })
    return withoutNulls<AuditPage>({ items: result.items, total: result.total, pages: result.pages ?? 1 })
  },
}
