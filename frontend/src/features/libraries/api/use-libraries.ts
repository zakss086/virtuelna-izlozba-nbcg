import { useQuery } from '@tanstack/react-query'

import { librariesApi } from './libraries-api'

export function useLibraries() {
  return useQuery({
    queryKey: ['libraries'],
    queryFn: librariesApi.list,
  })
}
