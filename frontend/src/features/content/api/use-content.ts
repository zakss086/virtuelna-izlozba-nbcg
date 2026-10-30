import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Localized } from '@/lib/i18n'

import { contentApi } from './content-api'

export function useContentBlocks() {
  return useQuery({ queryKey: ['content'], queryFn: contentApi.list })
}

export function useSaveContentBlock() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: Localized }) => contentApi.save(key, value),
    onSuccess: () => client.invalidateQueries({ queryKey: ['content'] }),
  })
}

export function useResetContentBlock() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (key: string) => contentApi.reset(key),
    onSuccess: () => client.invalidateQueries({ queryKey: ['content'] }),
  })
}
