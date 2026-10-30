import type { Collection } from '../types'

// Collections of the National Library digital library (dlib.me): the sample data of the mock, and the seed of the backend.
const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=800`

export const initialCollections: Collection[] = [
  {
    id: 1,
    position: 1,
    name: { me: 'Knjige', en: 'Books' },
    text: {
      me: 'Stare i rijetke knjige, od inkunabula do izdanja 19. vijeka.',
      en: 'Old and rare books, from incunabula to 19th century editions.',
    },
    href: 'https://dlib.me/me/knjige',
    image: commons('Bečko izdanje Gorskog vijenca 1847.png'),
  },
  {
    id: 2,
    position: 2,
    name: { me: 'Periodika', en: 'Periodicals' },
    text: {
      me: 'Više od 400 naslova novina i časopisa, među njima Glas Crnogorca.',
      en: 'More than 400 newspaper and journal titles, among them Glas Crnogorca.',
    },
    href: 'https://dlib.me/me/periodika',
    image: commons('Glas Crnogorca.jpeg'),
  },
  {
    id: 3,
    position: 3,
    name: { me: 'Rukopisi i dokumenta', en: 'Manuscripts and documents' },
    text: {
      me: 'Rukopisi, arhivalije i dokumenta iz istorije Crne Gore. Na slici: folio Oktoiha Đurđa Crnojevića.',
      en: 'Manuscripts, archival records and documents from Montenegrin history. Pictured: a folio of the Oktoih of Đurađ Crnojević.',
    },
    href: 'https://dlib.me/me/rukopisi-i-dokumenta',
    image: commons(
      'Serbian Cyrillic Serbian Language Octoechos folio Serb Dorde Crnojevic Cetinje 1496 Decani Monastery Serbia.png',
    ),
  },
  {
    id: 4,
    position: 4,
    name: { me: 'Karte i planovi', en: 'Maps and plans' },
    text: {
      me: 'Kartografska zbirka: karte, planovi gradova i pomorske karte. Na slici: specijalna karta Kneževine Crne Gore.',
      en: 'The cartographic collection: maps, town plans and sea charts. Pictured: a special map of the Principality of Montenegro.',
    },
    href: 'https://dlib.me/me/karte-i-planovi',
    image: commons('Special Karte des Fürstenthumes Montenegro (Cèrnagora) - HK 1124.jpg'),
  },
  {
    id: 5,
    position: 5,
    name: { me: 'Plakati i likovna građa', en: 'Posters and art' },
    text: {
      me: 'Plakati, grafike i likovna građa iz Likovno-grafičke zbirke. Na slici: linorez „Dan ustanka“ (1943).',
      en: 'Posters, prints and art from the Fine Art and Graphic Collection. Pictured: the linocut “Uprising Day” (1943).',
    },
    href: 'https://dlib.me/me/plakati-i-likovna-gradja',
    image: commons('Illustration commemorating Uprising Day in Montenegro.png'),
  },
  {
    id: 6,
    position: 6,
    name: { me: 'Fotografije i razglednice', en: 'Photographs and postcards' },
    text: {
      me: 'Fotografije i razglednice gradova i predjela Crne Gore.',
      en: 'Photographs and postcards of Montenegrin towns and landscapes.',
    },
    href: 'https://dlib.me/me/fotografije-i-razglednice',
    image: commons('The Convent, Cetinje, Montenegro WDL2609.png'),
  },
  {
    id: 7,
    position: 7,
    name: { me: 'Muzička i video građa', en: 'Music and video' },
    text: {
      me: 'Muzikalije, zvučni i audiovizuelni zapisi. Na slici: guslari, 1927.',
      en: 'Sheet music, audio and audiovisual recordings. Pictured: gusle players, 1927.',
    },
    href: 'https://dlib.me/me/muzicka-i-video-gradja',
    image: commons('Guslar players 1927 Tanasije Vucic, Svetozar Jacimovic and Ilija Vukovic.jpg'),
  },
  {
    id: 8,
    position: 8,
    name: { me: 'Njegoš i tematske zbirke', en: 'Njegoš and thematic collections' },
    text: {
      me: 'Tematske zbirke digitalne biblioteke, među njima zbirka Petra II Petrovića Njegoša.',
      en: 'Thematic collections of the digital library, including the Petar II Petrović Njegoš collection.',
    },
    href: 'https://dlib.me/me/tematske-zbirke',
    image: commons('Gorski Vijenac.jpg'),
  },
]
