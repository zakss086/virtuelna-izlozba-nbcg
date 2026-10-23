import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ExhibitionFilters, ExhibitionStatus, NewExhibition } from '../types'
import { exhibitionsApi } from './exhibitions-api'

export function useExhibitions(filters: ExhibitionFilters = {}) {
  return useQuery({
    queryKey: ['exhibitions', filters],
    queryFn: () => exhibitionsApi.list(filters),
  })
}

export function useExhibition(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['exhibitions', idOrSlug],
    queryFn: () => exhibitionsApi.get(idOrSlug ?? ''),
    enabled: Boolean(idOrSlug),
    retry: false,
  })
}

export function useCreateExhibition() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: NewExhibition) => exhibitionsApi.create(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['exhibitions'] }),
  })
}

export function useUpdateExhibition() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: Partial<NewExhibition> }) =>
      exhibitionsApi.update(id, changes),
    onSuccess: () => client.invalidateQueries({ queryKey: ['exhibitions'] }),
  })
}

export function useSetExhibitionStatus() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ExhibitionStatus }) =>
      exhibitionsApi.setStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: ['exhibitions'] }),
  })
}

export function useRemoveExhibition() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => exhibitionsApi.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['exhibitions'] }),
  })
}
