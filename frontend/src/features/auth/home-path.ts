import type { Role } from './types'

// Where each role lands right after signing in.
export function homePathFor(role: Role): string {
  switch (role) {
    case 'curator':
      return '/studio'
    case 'admin':
      return '/admin'
    case 'visitor':
      return '/'
  }
}
