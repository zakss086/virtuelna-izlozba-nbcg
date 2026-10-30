import { USE_API } from '@/lib/http'

import { httpAuditApi } from './audit-http'
import { mockAuditApi } from './audit-mock'

// `pnpm dev` shows a fixed sample, `pnpm dev:api` the real history from the backend.
export const auditApi = USE_API ? httpAuditApi : mockAuditApi
