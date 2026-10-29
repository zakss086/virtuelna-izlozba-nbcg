import { USE_API } from '@/lib/http'

import { httpExhibitionsApi } from './exhibitions-http'
import { mockExhibitionsApi } from './exhibitions-mock'

// `pnpm dev` runs on the in-browser mock data, `pnpm dev:api` on the backend. The hooks only see this object.
export const exhibitionsApi = USE_API ? httpExhibitionsApi : mockExhibitionsApi
