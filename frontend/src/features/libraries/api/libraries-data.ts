import type { Library, LibraryType, LocationPrecision } from '../types'

// Libraries of Montenegro, compiled from public sources:
//  - names and types: the list of full COBISS.CG members in the 2025 statistics (cg.cobiss.net/pokazatelji)
//  - coordinates: OpenStreetMap (© OpenStreetMap contributors, ODbL); "town" means the centre of the town
//  - address, website, phone, email: only where an official page or OpenStreetMap states them
// School libraries and entries whose town is not known are left out. Diacritics were restored by hand.

const TOWN = {
  Cetinje: [42.3896, 18.9246],
  Podgorica: [42.4415, 19.2621],
  Kotor: [42.4249, 18.7713],
  Nikšić: [42.7739, 18.9488],
  Bar: [42.098, 19.0955],
  Budva: [42.2886, 18.842],
  Tivat: [42.4304, 18.6988],
  Ulcinj: [41.926, 19.2056],
  'Herceg Novi': [42.4518, 18.5368],
  Berane: [42.8436, 19.8729],
  'Bijelo Polje': [43.0342, 19.7474],
  Pljevlja: [43.3562, 19.3579],
  Rožaje: [42.8433, 20.168],
  Mojkovac: [42.9625, 19.58],
  Kolašin: [42.8238, 19.5218],
  Žabljak: [43.1551, 19.1209],
  Plužine: [43.1562, 18.8452],
  Danilovgrad: [42.5524, 19.1053],
  Perast: [42.4863, 18.6989],
} as const

type Town = keyof typeof TOWN
type Extra = Partial<Pick<Library, 'address' | 'website' | 'email' | 'phone' | 'description' | 'image'>>
type Place = { lat: number; lng: number } | 'town' | 'none'

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=640`
const commonsPage = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`

let nextId = 1

function entry(name: string, type: LibraryType, city: Town, place: Place, extra: Extra = {}): Library {
  const id = nextId++
  if (place === 'none') return { id, name, type, city, ...extra }
  if (place === 'town') {
    const [lat, lng] = TOWN[city]
    return { id, name, type, city, ...extra, location: { lat, lng, precision: 'town' satisfies LocationPrecision } }
  }
  return { id, name, type, city, ...extra, location: { ...place, precision: 'exact' } }
}

export const libraries: Library[] = [
  entry('Nacionalna biblioteka Crne Gore „Đurđe Crnojević“', 'national', 'Cetinje', { lat: 42.3945, lng: 18.9151 }, {
    address: 'Bulevar crnogorskih junaka 163',
    website: 'https://www.nb-cg.me',
    email: 'info@nb-cg.me',
    phone: '+382 41 231 143',
    description: {
      me: 'Osnovana 1893. kao javna biblioteka kneza Nikole. Čuva oko dva miliona jedinica građe, među njima stare i rijetke knjige, atlase i karte, plakate i razglednice. Smještena je u dvije zgrade u Cetinju, nekadašnjim ambasadama Italije i Francuske.',
      en: 'Founded in 1893 as a public library by Prince Nikola. It holds about two million items, among them old and rare books, atlases and maps, posters and postcards. It occupies two buildings in Cetinje, the former Italian and French embassies.',
    },
    image: {
      url: commons('Former Italian Embassy in Cetinje, Montenegro.jpg'),
      credit: 'Сергей Наруков',
      license: 'CC BY 3.0',
      sourceUrl: commonsPage('Former Italian Embassy in Cetinje, Montenegro.jpg'),
    },
  }),

  entry('Centralna univerzitetska biblioteka', 'university', 'Podgorica', 'none', { website: 'https://www.ucg.ac.me' }),
  entry('Biblioteka prirodno-matematičkih i tehničkih nauka', 'university', 'Podgorica', 'none'),
  entry('Biblioteka umjetnosti', 'university', 'Cetinje', 'none'),
  entry('Arhitektonski fakultet', 'university', 'Podgorica', 'none'),
  entry('Biotehnički fakultet', 'university', 'Podgorica', 'none'),
  entry('Ekonomski fakultet', 'university', 'Podgorica', { lat: 42.44608, lng: 19.25712 }),
  entry('Fakultet političkih nauka', 'university', 'Podgorica', 'none'),
  entry('Fakultet za crnogorski jezik i književnost', 'university', 'Cetinje', 'none'),
  entry('Fakultet za pomorstvo', 'university', 'Kotor', 'none'),
  entry('Filozofski fakultet', 'university', 'Nikšić', { lat: 42.77423, lng: 18.95479 }),
  entry('Medicinski fakultet', 'university', 'Podgorica', { lat: 42.43662, lng: 19.24461 }),
  entry('Pravni fakultet', 'university', 'Podgorica', { lat: 42.44603, lng: 19.25643 }),
  entry('Univerzitet Donja Gorica', 'university', 'Podgorica', { lat: 42.41755, lng: 19.2029 }),

  entry('Centar za kulturu Kolašin, Gradska biblioteka „Ljubo Anđelić“', 'public', 'Kolašin', { lat: 42.8235, lng: 19.5209 }),
  entry('Centar za kulturu Žabljak', 'public', 'Žabljak', 'town'),
  entry('Gradska biblioteka i čitaonica Herceg Novi', 'public', 'Herceg Novi', { lat: 42.45143, lng: 18.53732 }, {
    address: 'Trg Herceg Stjepana 6',
  }),
  entry('Gradska biblioteka Kotor', 'public', 'Kotor', 'town'),
  entry('Gradska biblioteka Mojkovac', 'public', 'Mojkovac', 'town'),
  entry('Gradska biblioteka Plužine', 'public', 'Plužine', 'town'),
  entry('JU Gradska biblioteka Tivat', 'public', 'Tivat', 'town'),
  entry('JU Narodna biblioteka „Miroslav Luketić“', 'public', 'Budva', 'town', {
    description: {
      me: 'Gradska biblioteka u Budvi smještena je u Citadeli, utvrđenom starom jezgru grada.',
      en: 'The municipal library of Budva is located in the Citadel, the fortified old core of the town.',
    },
    image: {
      url: commons('Budva Zitadelle - Bibliothek 2.jpg'),
      credit: 'Wolfgang Sauber',
      license: 'CC BY-SA 4.0',
      sourceUrl: commonsPage('Budva Zitadelle - Bibliothek 2.jpg'),
    },
  }),
  entry('Narodna biblioteka „Dr Radovan Lalić“', 'public', 'Berane', 'town'),
  entry('Narodna biblioteka „Mihailo-Miho Vuković“', 'public', 'Danilovgrad', 'town'),
  entry('Narodna biblioteka „Mirko Srzentić“', 'public', 'Ulcinj', 'town'),
  entry('Narodna biblioteka „Njegoš“', 'public', 'Nikšić', 'town', {
    image: {
      url: commons('Library in Nikšić.jpg'),
      credit: 'Niegodzisie',
      license: 'CC BY-SA 4.0',
      sourceUrl: commonsPage('Library in Nikšić.jpg'),
    },
  }),
  entry('Narodna biblioteka „Radosav Ljumović“', 'public', 'Podgorica', { lat: 42.4417, lng: 19.26226 }, {
    address: 'Njegoševa 22',
    website: 'https://www.nbpg.me',
  }),
  entry('Narodna biblioteka „Stevan Samardžić“', 'public', 'Pljevlja', { lat: 43.3557, lng: 19.3561 }),
  entry('Narodna biblioteka Bijelo Polje', 'public', 'Bijelo Polje', 'town'),
  entry('Narodna biblioteka i čitaonica „Ivo Vučković“', 'public', 'Bar', 'town'),
  entry('Narodna biblioteka i čitaonica „Njegoš“', 'public', 'Cetinje', { lat: 42.3912, lng: 18.9225 }),
  entry('Narodna biblioteka Rožaje', 'public', 'Rožaje', 'town'),

  entry('Biblioteka Muzeja grada Perasta', 'special', 'Perast', 'town'),
  entry('Crnogorska akademija nauka i umjetnosti', 'special', 'Podgorica', 'none'),
  entry('Istorijski institut Crne Gore', 'special', 'Podgorica', { lat: 42.43953, lng: 19.24988 }),
  entry('Matica crnogorska', 'special', 'Podgorica', 'none'),
  entry('Narodni muzej Crne Gore', 'special', 'Cetinje', { lat: 42.38931, lng: 18.92316 }, {
    description: {
      me: 'Fotografija prikazuje Vladin dom u Cetinju, nekadašnju zgradu vlade u kojoj su danas Umjetnički i Istorijski muzej.',
      en: 'The photo shows the Government House in Cetinje, the former seat of the government, which now houses the Art Museum and the History Museum.',
    },
    image: {
      url: commons('Vladin Dom (Dom Rządowy) w Cetinje 01.jpg'),
      credit: 'Marcin Konsek',
      license: 'CC BY-SA 4.0',
      sourceUrl: commonsPage('Vladin Dom (Dom Rządowy) w Cetinje 01.jpg'),
    },
  }),
  entry('Pomorski muzej Crne Gore', 'special', 'Kotor', 'none'),
  entry('Skupština Crne Gore', 'special', 'Podgorica', { lat: 42.43989, lng: 19.26054 }),
]
