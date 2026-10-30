// Visitors have no account; only library staff sign in.
export type Role = 'curator' | 'admin'

export type User = {
  id: number
  name: string
  email: string
  role: Role
  isActive: boolean
}

export type NewUser = { name: string; email: string; role: Role; password: string }

// Only the fields that are sent change (an admin cannot change their own role or switch themselves off).
export type UserChanges = Partial<{ name: string; role: Role; isActive: boolean; password: string }>
