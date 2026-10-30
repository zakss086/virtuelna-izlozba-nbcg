import { USE_API } from '@/lib/http'

import { httpMediaApi } from './media-http'
import { mockMediaApi } from './media-mock'

// `pnpm dev` keeps uploads in memory, `pnpm dev:api` stores them on the backend.
export const mediaApi = USE_API ? httpMediaApi : mockMediaApi
