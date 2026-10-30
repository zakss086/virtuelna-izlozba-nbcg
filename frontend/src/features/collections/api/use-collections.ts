import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { NewCollection } from '../types'
import { collectionsApi } from './collections-api'

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: collectionsApi.list,
  })
}

export function useCreateCollection() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: NewCollection) => collectionsApi.create(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['collections'] }),
  })
}

export function useUpdateCollection() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<NewCollection> }) =>
      collectionsApi.update(id, changes),
    onSuccess: () => client.invalidateQueries({ queryKey: ['collections'] }),
  })
}

export function useDeleteCollection() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => collectionsApi.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['collections'] }),
  })
}
