import { useQuery } from '@tanstack/react-query'

import { collectionsApi } from './collections-api'

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.list,
  })
}
