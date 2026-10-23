import { useSyncExternalStore } from 'react'

import { favoritesStore } from './favorites-store'

const empty: number[] = []

export function useFavorites() {
  const ids = useSyncExternalStore(favoritesStore.subscribe, favoritesStore.get, () => empty)
  return { ids, isFavorite: (id: number) => ids.includes(id), toggle: favoritesStore.toggle }
}
