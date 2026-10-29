import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useSyncExternalStore } from 'react'

import { authApi } from './auth-api'

export function useCurrentUser() {
  return useSyncExternalStore(authApi.subscribe, authApi.current, () => null)
}

// Who is signed in decides which exhibitions the backend returns (drafts of the author, everything for an admin),
// so cached exhibitions are refetched when the user changes.
export function useSignIn() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authApi.signIn(email, password),
    onSuccess: () => client.invalidateQueries({ queryKey: ['exhibitions'] }),
  })
}

export function useSignOut() {
  const client = useQueryClient()
  return useCallback(() => {
    authApi.signOut()
    void client.invalidateQueries({ queryKey: ['exhibitions'] })
  }, [client])
}

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: authApi.list })
}
