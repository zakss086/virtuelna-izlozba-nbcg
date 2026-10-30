import { useExhibitions } from './use-exhibitions'

// Every video of the published exhibitions, each with the exhibition it belongs to.
export function useVideoEntries() {
  const query = useExhibitions({ status: 'published' })
  const entries = (query.data ?? []).flatMap((exhibition) =>
    exhibition.videos.map((video) => ({ video, exhibition })),
  )
  return { ...query, entries }
}

export type VideoEntry = ReturnType<typeof useVideoEntries>['entries'][number]
