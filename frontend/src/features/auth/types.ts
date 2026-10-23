export type Role = 'visitor' | 'curator' | 'admin'

export type User = {
  id: number
  name: string
  email: string
  role: Role
}
