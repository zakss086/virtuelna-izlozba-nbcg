import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { NewMediaAsset } from '../types'
import { mediaApi } from './media-api'

export function useMediaAssets() {
  return useQuery({ queryKey: ['media'], queryFn: mediaApi.list })
}

export function useUploadMedia() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: NewMediaAsset) => mediaApi.upload(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['media'] }),
  })
}

export function useDeleteMedia() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => mediaApi.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['media'] }),
  })
}
