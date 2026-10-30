import { USE_API } from '@/lib/http'

import { httpLibrariesApi } from './libraries-http'
import { mockLibrariesApi } from './libraries-mock'

// `pnpm dev` uses the in-memory libraries, `pnpm dev:api` the backend.
export const librariesApi = USE_API ? httpLibrariesApi : mockLibrariesApi
