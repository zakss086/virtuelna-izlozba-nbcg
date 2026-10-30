import { USE_API } from '@/lib/http'

import { httpContentApi } from './content-http'
import { mockContentApi } from './content-mock'

// `pnpm dev` keeps edited texts in memory, `pnpm dev:api` in the backend database.
export const contentApi = USE_API ? httpContentApi : mockContentApi
