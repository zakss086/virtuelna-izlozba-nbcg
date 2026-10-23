import { useMutation, useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

import { authApi } from './auth-api'

export function useCurrentUser() {
  return useSyncExternalStore(authApi.subscribe, authApi.current, () => null)
}

export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authApi.signIn(email, password),
  })
}

export function useSignOut() {
  return authApi.signOut
}

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: authApi.list })
}
