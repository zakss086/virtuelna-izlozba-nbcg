import { Ornament } from '@/components/ornament'
import { ExternalLink } from 'lucide-react'

import { Reveal } from '@/components/reveal'
import { SmartImage } from '@/components/smart-image'
import { ExhibitionsGrid } from '@/features/exhibitions/components/exhibitions-grid'
import { FavoriteButton } from '@/features/favorites/components/favorite-button'
import { makeArt } from '@/lib/art'
import { useI18n } from '@/lib/i18n'

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=800`

type Collection = {
  name: { me: string; en: string }
  text: { me: string; en: string }
  href: string
  image: string
}

const COLLECTIONS: Collection[] = [
  {
    name: { me: 'Knjige', en: 'Books' },
    text: {
      me: 'Stare i rijetke knjige, od inkunabula do izdanja 19. vijeka.',
      en: 'Old and rare books, from incunabula to 19th century editions.',
    },
    href: 'https://dlib.me/me/knjige',
    image: commons('Bečko izdanje Gorskog vijenca 1847.png'),
  },
  {
    name: { me: 'Periodika', en: 'Periodicals' },
    text: {
      me: 'Više od 400 naslova novina i časopisa, među njima Glas Crnogorca.',
      en: 'More than 400 newspaper and journal titles, among them Glas Crnogorca.',
    },
    href: 'https://dlib.me/me/periodika',
    image: commons('Glas Crnogorca.jpeg'),
  },
  {
    name: { me: 'Rukopisi i dokumenta', en: 'Manuscripts and documents' },
    text: {
      me: 'Rukopisi, arhivalije i dokumenta iz istorije Crne Gore.',
      en: 'Manuscripts, archival records and documents from Montenegrin history.',
    },
    href: 'https://dlib.me/me/rukopisi-i-dokumenta',
    image: makeArt('manuscript', 'Rukopisi i dokumenta', 'dlib.me'),
  },
  {
    name: { me: 'Karte i planovi', en: 'Maps and plans' },
    text: {
      me: 'Kartografska zbirka: karte, planovi gradova i pomorske karte.',
      en: 'The cartographic collection: maps, town plans and sea charts.',
    },
    href: 'https://dlib.me/me/karte-i-planovi',
    image: makeArt('map', 'Karte i planovi', 'dlib.me'),
  },
  {
    name: { me: 'Plakati i likovna građa', en: 'Posters and art' },
    text: {
      me: 'Plakati, grafike i likovna građa iz Likovno-grafičke zbirke.',
      en: 'Posters, prints and art from the Fine Art and Graphic Collection.',
    },
    href: 'https://dlib.me/me/plakati-i-likovna-gradja',
    image: makeArt('poster', 'Plakati i likovna građa', 'dlib.me'),
  },
  {
    name: { me: 'Fotografije i razglednice', en: 'Photographs and postcards' },
    text: {
      me: 'Fotografije i razglednice gradova i predjela Crne Gore.',
      en: 'Photographs and postcards of Montenegrin towns and landscapes.',
    },
    href: 'https://dlib.me/me/fotografije-i-razglednice',
    image: commons('The Convent, Cetinje, Montenegro WDL2609.png'),
  },
  {
    name: { me: 'Muzička i video građa', en: 'Music and video' },
    text: {
      me: 'Muzikalije, zvučni i audiovizuelni zapisi.',
      en: 'Sheet music, audio and audiovisual recordings.',
    },
    href: 'https://dlib.me/me/muzicka-i-video-gradja',
    image: makeArt('audio', 'Muzička i video građa', 'dlib.me'),
  },
  {
    name: { me: 'Njegoš i tematske zbirke', en: 'Njegoš and thematic collections' },
    text: {
      me: 'Tematske zbirke digitalne biblioteke, među njima zbirka Petra II Petrovića Njegoša.',
      en: 'Thematic collections of the digital library, including the Petar II Petrović Njegoš collection.',
    },
    href: 'https://dlib.me/me/tematske-zbirke',
    image: commons('Gorski Vijenac.jpg'),
  },
]

export function Collections() {
  const { t, l } = useI18n()

  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-semibold">{t('collections.title')}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t('collections.lead')}</p>
          <Ornament className="mt-4" />
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((collection, index) => (
            <li key={collection.href}>
              <Reveal delay={(index % 4) * 80} className="h-full">
                <a
                  href={collection.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-ink">
                    <SmartImage
                      src={collection.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h2 className="text-xl font-semibold">{l(collection.name)}</h2>
                    <p className="text-sm text-muted-foreground">{l(collection.text)}</p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm text-gold">
                      {t('collections.open')}
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="from-collections" className="flex flex-col gap-6">
        <h2 id="from-collections" className="text-3xl font-semibold">
          {t('collections.exhibitions')}
        </h2>
        <ExhibitionsGrid limit={3} renderAction={(e) => <FavoriteButton exhibitionId={e.id} />} />
      </section>
    </div>
  )
}
