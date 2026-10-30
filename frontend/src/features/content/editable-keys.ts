import type { MessageKey } from '@/lib/messages'

export type ContentGroup = 'home' | 'pages' | 'about' | 'footer'

// The site texts an admin may edit. Only plain texts without placeholders belong here.
export const EDITABLE_CONTENT: { group: ContentGroup; key: MessageKey }[] = [
  { group: 'home', key: 'home.lead' },
  { group: 'home', key: 'home.templates' },
  { group: 'home', key: 'home.about.title' },
  { group: 'home', key: 'home.about.text' },
  { group: 'home', key: 'home.hero.caption.1' },
  { group: 'home', key: 'home.hero.caption.2' },
  { group: 'home', key: 'home.hero.caption.3' },
  { group: 'pages', key: 'collections.lead' },
  { group: 'pages', key: 'videos.lead' },
  { group: 'about', key: 'about.lead' },
  { group: 'about', key: 'about.mission.title' },
  { group: 'about', key: 'about.mission.text' },
  { group: 'about', key: 'about.contact.text' },
  { group: 'about', key: 'about.credits.text' },
  { group: 'footer', key: 'footer.note' },
]

export const CONTENT_GROUPS: ContentGroup[] = ['home', 'pages', 'about', 'footer']
