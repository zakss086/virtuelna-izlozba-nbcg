import { USE_API } from '@/lib/http'

import { httpCollectionsApi } from './collections-http'
import { mockCollectionsApi } from './collections-mock'

// `pnpm dev` uses the in-memory collections, `pnpm dev:api` the backend.
export const collectionsApi = USE_API ? httpCollectionsApi : mockCollectionsApi
