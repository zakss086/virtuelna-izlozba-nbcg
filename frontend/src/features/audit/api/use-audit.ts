import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { AuditEntityType } from '../types'
import { auditApi } from './audit-api'

export function useAuditHistory(entityType: AuditEntityType | undefined, page: number) {
  return useQuery({
    queryKey: ['audit', entityType ?? 'all', page],
    queryFn: () => auditApi.list(entityType, page),
    placeholderData: keepPreviousData,
  })
}
