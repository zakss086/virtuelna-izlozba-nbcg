import type { MessageKey } from '@/lib/messages'

export type ContentGroup = 'home' | 'pages' | 'about' | 'templates' | 'hints' | 'staff' | 'footer'

export const CONTENT_GROUPS: ContentGroup[] = [
  'home',
  'pages',
  'about',
  'templates',
  'hints',
  'staff',
  'footer',
]

// The site texts an admin may edit: what visitors read (pages, headings, descriptions, hints and notices).
// Not offered: labels of buttons and menus, and the texts of the exhibition editor and the assistant, which belong
// to how the screens work. A text with `{name}` marks may be edited too; the editor keeps the marks in place.
const GROUPS: Record<ContentGroup, MessageKey[]> = {
  home: [
    'home.lead',
    'home.templates',
    'home.featured',
    'home.featured.read',
    'home.about.title',
    'home.about.text',
    'home.about.cta',
    'home.hero.caption.1',
    'home.hero.caption.2',
    'home.hero.caption.3',
  ],
  pages: [
    'collections.title',
    'collections.lead',
    'videos.title',
    'videos.lead',
    'map.title',
    'map.lead',
    'map.hint',
    'map.legend',
    'map.count',
    'map.nearestResult',
    'libraries.sources.title',
    'libraries.sources.body',
  ],
  about: [
    'about.title',
    'about.lead',
    'about.mission.title',
    'about.mission.text',
    'about.how.title',
    'about.how.1.title',
    'about.how.1.text',
    'about.how.2.title',
    'about.how.2.text',
    'about.how.3.title',
    'about.how.3.text',
    'about.numbers.title',
    'about.contact.title',
    'about.contact.text',
    'about.credits.title',
    'about.credits.text',
  ],
  templates: [
    'tpl.timeline.desc',
    'tpl.gallery.desc',
    'tpl.map.desc',
    'tpl.slider.desc',
    'tpl.room.desc',
    'tpl.book.desc',
    'tpl.carousel.desc',
    'tpl.cards.desc',
  ],
  hints: [
    'viewer.citeText',
    'viewer.roomHint',
    'viewer.bookHint',
    'viewer.carouselHint',
    'viewer.cardsHint',
    'viewer.catalogHint',
    'item.zoomHint',
    'gallery.empty',
    'fav.emptyHint',
    'catalog.error',
    'common.error',
    'notice.offline',
  ],
  staff: ['auth.lead', 'profile.desc.curator', 'profile.desc.admin'],
  footer: ['footer.note'],
}

export const EDITABLE_CONTENT: { group: ContentGroup; key: MessageKey }[] = CONTENT_GROUPS.flatMap((group) =>
  GROUPS[group].map((key) => ({ group, key })),
)
