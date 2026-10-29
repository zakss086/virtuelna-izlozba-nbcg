import { useMutation } from '@tanstack/react-query'

import type { KnowledgeDoc } from '@/lib/knowledge'

import { assistantApi } from './assistant-api'

export function useAskAssistant() {
  return useMutation({
    mutationFn: ({ question, docs }: { question: string; docs: KnowledgeDoc[] }) =>
      assistantApi.ask(question, docs),
  })
}
