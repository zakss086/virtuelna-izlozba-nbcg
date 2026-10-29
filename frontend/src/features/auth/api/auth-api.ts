import { USE_API } from '@/lib/http'

import { httpAuthApi } from './auth-http'
import { DEMO_PASSWORD, mockAuthApi } from './auth-mock'

// `pnpm dev` signs in against the mock accounts, `pnpm dev:api` against the backend. Same demo accounts in both.
export const authApi = USE_API ? httpAuthApi : mockAuthApi
export { DEMO_PASSWORD }
