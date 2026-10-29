// Visitors have no account; only library staff sign in.
export type Role = 'curator' | 'admin'

export type User = {
  id: number
  name: string
  email: string
  role: Role
}
