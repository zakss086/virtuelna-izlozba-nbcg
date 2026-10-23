import { makeArt } from '@/lib/art'
import { delay } from '@/lib/mock-db'

import type { Collection } from '../types'

// Collections of the National Library digital library (dlib.me). Mock data until the backend serves them.
const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=800`

const collections: Collection[] = [
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

export const collectionsApi = {
  list: () => delay(collections),
}
