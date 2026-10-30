import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { NewLibrary } from '../types'
import { librariesApi } from './libraries-api'

export function useLibraries() {
  return useQuery({
    queryKey: ['libraries'],
    queryFn: librariesApi.list,
  })
}

export function useLibrary(id: number | undefined) {
  return useQuery({
    queryKey: ['libraries', id],
    queryFn: () => librariesApi.get(id ?? 0),
    enabled: id !== undefined,
    retry: false,
  })
}

export function useCreateLibrary() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: NewLibrary) => librariesApi.create(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['libraries'] }),
  })
}

export function useUpdateLibrary() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<NewLibrary> }) =>
      librariesApi.update(id, changes),
    onSuccess: () => client.invalidateQueries({ queryKey: ['libraries'] }),
  })
}

export function useDeleteLibrary() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => librariesApi.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['libraries'] }),
  })
}
