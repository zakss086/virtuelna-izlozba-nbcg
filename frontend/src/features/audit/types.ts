export type AuditAction = 'create' | 'update' | 'delete'

export type AuditEntityType = 'exhibition' | 'content' | 'library' | 'collection' | 'user' | 'media'

export const AUDIT_ENTITY_TYPES: AuditEntityType[] = [
  'exhibition',
  'content',
  'library',
  'collection',
  'user',
  'media',
]

// One change made by a signed-in user. The actor's name and the label are copied at the time of the change.
export type AuditEntry = {
  id: number
  createdAt: string
  actorId?: number
  actorName: string
  action: AuditAction
  entityType: AuditEntityType
  entityRef: string
  label: string
  // Codes the screen translates, separated by ", ": `status=draft>pending`, `role=curator>admin`, `switched_off`,
  // `new_password`, `default_restored`, `type=image/png`, `size=1200`, or the names of the changed fields.
  detail?: string
}

export type AuditPage = { items: AuditEntry[]; total: number; pages: number }
