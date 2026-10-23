import { makeArt } from '@/lib/art'

import type { Exhibition, ExhibitionItem, ExhibitionVideo, ItemType, Place, Section } from '../types'

// Sample data inspired by the National Library of Montenegro collections (nb-cg.me, dlib.me).
// Images and videos are freely licensed files from Wikimedia Commons, linked directly (see `credit` and `rights`).
// Texts are simplified for the demo.

let nextItemId = 1
let nextSectionId = 1
let nextVideoId = 1

const COMMONS = 'https://commons.wikimedia.org/wiki/Special:FilePath/'
const commons = (file: string, width = 1200) => `${COMMONS}${encodeURIComponent(file)}?width=${width}`
const commonsPage = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`

// PDF first-page thumbnails use fixed thumbnail paths on Wikimedia.
const LUCA_PDF =
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/%D0%9F%D0%B5%D1%82%D0%B0%D1%80_%D0%9F%D0%B5%D1%82%D1%80%D0%BE%D0%B2%D0%B8%D1%9B_%D0%8A%D0%B5%D0%B3%D0%BE%D1%88_-_%D0%9B%D1%83%D1%87%D0%B0_%D0%BC%D0%B8%D0%BA%D1%80%D0%BE%D0%BA%D0%BE%D0%B7%D0%BC%D0%B0_%281845%29.pdf/page1-1280px-%D0%9F%D0%B5%D1%82%D0%B0%D1%80_%D0%9F%D0%B5%D1%82%D1%80%D0%BE%D0%B2%D0%B8%D1%9B_%D0%8A%D0%B5%D0%B3%D0%BE%D1%88_-_%D0%9B%D1%83%D1%87%D0%B0_%D0%BC%D0%B8%D0%BA%D1%80%D0%BE%D0%BA%D0%BE%D0%B7%D0%BC%D0%B0_%281845%29.pdf.jpg'
const GLAS_PDF =
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/List_Glas_Crnogoraca_I_broj.pdf/page1-1280px-List_Glas_Crnogoraca_I_broj.pdf.jpg'

// Direct thumbnail URLs (CORS-enabled). The 3D room loads pictures as WebGL textures, which the redirecting
// Special:FilePath links cannot serve.
const DIRECT: Record<string, string> = {
  'Mount Lovćen and Štirovnik, Montenegro, September 2022 03.jpg':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Mount_Lov%C4%87en_and_%C5%A0tirovnik%2C_Montenegro%2C_September_2022_03.jpg/1280px-Mount_Lov%C4%87en_and_%C5%A0tirovnik%2C_Montenegro%2C_September_2022_03.jpg',
  'Lago Skadar, Montenegro, 2014-04-14, DD 01.JPG':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Lago_Skadar%2C_Montenegro%2C_2014-04-14%2C_DD_01.JPG/1280px-Lago_Skadar%2C_Montenegro%2C_2014-04-14%2C_DD_01.JPG',
  'Perast from a boat.jpg':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Perast_from_a_boat.jpg/1280px-Perast_from_a_boat.jpg',
  'View over Kotor bay and old town.jpg':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/View_over_Kotor_bay_and_old_town.jpg/1280px-View_over_Kotor_bay_and_old_town.jpg',
  'View of Budva Old Town.jpg':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/View_of_Budva_Old_Town.jpg/1280px-View_of_Budva_Old_Town.jpg',
  'Crno jezero 2020.jpg':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Crno_jezero_2020.jpg/1280px-Crno_jezero_2020.jpg',
  'Cetinje, october 2021 - 03.jpg':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Cetinje%2C_october_2021_-_03.jpg/1280px-Cetinje%2C_october_2021_-_03.jpg',
  '2025-07-13 Tara River Canyon 1.jpg':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/2025-07-13_Tara_River_Canyon_1.jpg/1280px-2025-07-13_Tara_River_Canyon_1.jpg',
}

type ItemInput = {
  type: ItemType
  me: string
  en: string
  creator: string
  year?: number
  collection: string
  file?: string
  url?: string
  license: string
}

function item(input: ItemInput): ExhibitionItem {
  const imageUrl =
    input.url ??
    (input.file ? DIRECT[input.file] : undefined) ??
    (input.file ? commons(input.file) : makeArt(input.type, input.me, String(input.year ?? '')))
  return {
    id: nextItemId++,
    type: input.type,
    title: { me: input.me, en: input.en },
    creator: input.creator,
    year: input.year,
    collection: input.collection,
    imageUrl,
    sourceUrl: input.file ? commonsPage(input.file) : 'https://dlib.me',
    rights: `${input.license} · Wikimedia Commons`,
  }
}

function section(
  me: string,
  en: string,
  textMe: string,
  textEn: string,
  items: ExhibitionItem[],
  extra: { year?: number; place?: Place } = {},
): Section {
  return { id: nextSectionId++, title: { me, en }, text: { me: textMe, en: textEn }, items, ...extra }
}

function video(
  me: string,
  en: string,
  descMe: string,
  descEn: string,
  file: string,
  credit: string,
  license: string,
): ExhibitionVideo {
  return {
    id: nextVideoId++,
    title: { me, en },
    description: { me: descMe, en: descEn },
    src: `${COMMONS}${encodeURIComponent(file)}`,
    credit,
    license,
    sourceUrl: commonsPage(file),
  }
}

const place = (me: string, en: string, lat: number, lng: number): Place => ({ name: { me, en }, lat, lng })
const cover = (file: string) => commons(file, 1600)

export const initialVideos = {
  perast: video(
    'Perast iz vazduha',
    'Perast from the air',
    'Dronom snimljen pogled na Perast i ostrva u Bokokotorskom zalivu.',
    'A drone view of Perast and the islets in the Bay of Kotor.',
    'Perast Montenegro by Drone.webm',
    'Wikimedia Commons',
    'CC BY 3.0',
  ),
  kotor: video(
    'Boka kotorska 2012.',
    'Bay of Kotor, 2012',
    'Plovidba i pogledi na Bokokotorski zaliv.',
    'Sailing and views across the Bay of Kotor.',
    'Bay of Kotor 2012.webm',
    'Wikimedia Commons',
    'CC BY-SA 4.0',
  ),
  budva: video(
    'Budva, Nova godina 2022.',
    'Budva, New Year 2022',
    'Novogodišnje veče u primorskom gradu Budvi.',
    'New Year’s Eve in the coastal town of Budva.',
    'Budva (Montenegro) - New Year 2022.webm',
    'Wikimedia Commons',
    'CC BY-SA 4.0',
  ),
}

export const initialExhibitions: Exhibition[] = [
  {
    id: 1,
    slug: 'od-oktoiha-do-gorskog-vijenca',
    title: { me: 'Od Oktoiha do Gorskog vijenca', en: 'From the Oktoih to The Mountain Wreath' },
    summary: {
      me: 'Vijekovi crnogorske knjige: od prvih štampanih knjiga Đurđa Crnojevića do Njegoševih djela i prvog broja Glasa Crnogorca.',
      en: 'Centuries of the Montenegrin book: from the first books printed under Đurađ Crnojević to Njegoš’s works and the first issue of Glas Crnogorca.',
    },
    coverUrl: cover('Bečko izdanje Gorskog vijenca 1847.png'),
    template: 'timeline',
    status: 'published',
    period: '1494 – 1873',
    tags: ['Montenegrina', 'Njegoš', 'Stara i rijetka knjiga'],
    authorId: 2,
    authorName: 'Marko Vuković',
    createdAt: '2026-10-02',
    videos: [],
    sections: [
      section(
        'Oktoih: prve štampane knjige',
        'The Oktoih: the first printed books',
        'Oktoisi štampani 1494. u štampariji Đurđa Crnojevića spadaju među najstarije štampane knjige južnoslovenskog prostora. Štampariju je vodio jeromonah Makarije.',
        'The Oktoih books printed in 1494 in the press of Đurađ Crnojević are among the oldest printed books of the South Slavic lands. The press was led by hieromonk Makarije.',
        [
          item({
            type: 'book',
            me: 'Oktoih petoglasnik',
            en: 'Oktoih Petoglasnik',
            creator: 'Makarije',
            year: 1494,
            collection: 'Pedagoški muzej, Beograd',
            file: 'Oktoih petoglasnik iz 1494. eksponat iz zbirke Pedagoškog muzeja u Beogradu.jpg',
            license: 'CC BY-SA 4.0',
          }),
        ],
        { year: 1494, place: place('Cetinje', 'Cetinje', 42.3931, 18.9233) },
      ),
      section(
        'Luča mikrokozma',
        'The Ray of the Microcosm',
        'Petar II Petrović Njegoš objavljuje spjev Luča mikrokozma, filozofsko djelo o mjestu čovjeka u svemiru.',
        'Petar II Petrović Njegoš publishes The Ray of the Microcosm, a philosophical poem about the place of man in the universe.',
        [
          item({
            type: 'book',
            me: 'Luča mikrokozma',
            en: 'The Ray of the Microcosm',
            creator: 'Petar II Petrović Njegoš',
            year: 1845,
            collection: 'Montenegrina',
            url: LUCA_PDF,
            file: 'Петар Петровић Његош - Луча микрокозма (1845).pdf',
            license: 'Public domain',
          }),
        ],
        { year: 1845, place: place('Njeguši', 'Njeguši', 42.415, 18.833) },
      ),
      section(
        'Gorski vijenac',
        'The Mountain Wreath',
        'Gorski vijenac, štampan u Beču 1847, smatra se vrhuncem Njegoševog stvaralaštva i temeljnim djelom crnogorske književnosti.',
        'The Mountain Wreath, printed in Vienna in 1847, is regarded as the peak of Njegoš’s work and a foundational text of Montenegrin literature.',
        [
          item({
            type: 'book',
            me: 'Gorski vijenac, bečko izdanje',
            en: 'The Mountain Wreath, Vienna edition',
            creator: 'Petar II Petrović Njegoš',
            year: 1847,
            collection: 'Montenegrina',
            file: 'Bečko izdanje Gorskog vijenca 1847.png',
            license: 'Public domain',
          }),
        ],
        { year: 1847, place: place('Cetinje', 'Cetinje', 42.3931, 18.9233) },
      ),
      section(
        'Glas Crnogorca',
        'Glas Crnogorca',
        'List Glas Crnogorca izlazi na Cetinju od 1873. i decenijama bilježi političko i kulturno življenje Crne Gore.',
        'The newspaper Glas Crnogorca began appearing in Cetinje in 1873 and for decades documented the political and cultural life of Montenegro.',
        [
          item({
            type: 'periodical',
            me: 'Glas Crnogorca, prvi broj',
            en: 'Glas Crnogorca, first issue',
            creator: 'Redakcija lista',
            year: 1873,
            collection: 'Periodika',
            url: GLAS_PDF,
            file: 'List Glas Crnogoraca I broj.pdf',
            license: 'Public domain',
          }),
        ],
        { year: 1873, place: place('Cetinje', 'Cetinje', 42.3931, 18.9233) },
      ),
    ],
  },
  {
    id: 2,
    slug: 'crna-gora-u-kadru',
    title: { me: 'Crna Gora u kadru', en: 'Montenegro in Frame' },
    summary: {
      me: 'Od razglednica iz 1912. do savremenih fotografija: primorje, rijeke, jezera i planine u galeriji sa video zapisima.',
      en: 'From 1912 postcards to contemporary photographs: coast, rivers, lakes and mountains in a gallery with video.',
    },
    coverUrl: cover('View of Kotor bay and old town.jpg'),
    template: 'gallery',
    status: 'published',
    period: '1912 – 2025',
    tags: ['Fotografije', 'Razglednice', 'Pejzaži', 'Video'],
    authorId: 4,
    authorName: 'Nikola Radović',
    createdAt: '2026-10-12',
    videos: [initialVideos.perast, initialVideos.kotor],
    sections: [
      section(
        'Razglednice iz 1912.',
        'Postcards from 1912',
        'Razglednice iz vremena kada se Crna Gora oblikovala kao država u regionu.',
        'Postcards from the time when Montenegro was taking shape as a state in the region.',
        [
          item({
            type: 'photo',
            me: 'Knjaz Danilo, razglednica',
            en: 'Prince Danilo, postcard',
            creator: 'Nepoznat autor',
            year: 1912,
            collection: 'Razglednice',
            file: 'Montenegro Danillo 1912.jpg',
            license: 'Public domain',
          }),
          item({
            type: 'photo',
            me: 'Crnogorski vojnik, razglednica',
            en: 'Montenegrin soldier, postcard',
            creator: 'Nepoznat autor',
            year: 1912,
            collection: 'Razglednice',
            file: 'Montenegrin soldier, postcard from 1912.jpg',
            license: 'Public domain',
          }),
          item({
            type: 'photo',
            me: 'Bar (Antivari), željeznička stanica',
            en: 'Antivari, railway station',
            creator: 'Nepoznat autor',
            collection: 'Razglednice',
            file: 'Antivari - Station de la Voie Ferree.jpg',
            license: 'Public domain',
          }),
        ],
      ),
      section(
        'Primorje',
        'The coast',
        'Boka kotorska i Budva privlače putnike zbog starih gradova i mora.',
        'The Bay of Kotor and Budva draw travellers with old towns and the sea.',
        [
          item({
            type: 'photo',
            me: 'Stari grad Kotor',
            en: 'Kotor old town',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'Kotor old town 3.JPG',
            license: 'CC BY-SA 4.0',
          }),
          item({
            type: 'photo',
            me: 'Perast s mora',
            en: 'Perast from the sea',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'Perast from a boat.jpg',
            license: 'CC BY-SA 4.0',
          }),
          item({
            type: 'photo',
            me: 'Stari grad Budva',
            en: 'Budva old town',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'View of Budva Old Town.jpg',
            license: 'CC BY-SA 4.0',
          }),
        ],
      ),
      section(
        'Jezera, rijeke i planine',
        'Lakes, rivers and mountains',
        'Skadarsko jezero, Crno jezero na Durmitoru i kanjon Tare.',
        'Lake Skadar, the Black Lake on Durmitor and the Tara canyon.',
        [
          item({
            type: 'photo',
            me: 'Skadarsko jezero',
            en: 'Lake Skadar',
            creator: 'Wikimedia Commons',
            year: 2014,
            collection: 'Fotografije',
            file: 'Lago Skadar, Montenegro, 2014-04-14, DD 01.JPG',
            license: 'CC BY-SA 3.0',
          }),
          item({
            type: 'photo',
            me: 'Crno jezero, Durmitor',
            en: 'Black Lake, Durmitor',
            creator: 'Wikimedia Commons',
            year: 2020,
            collection: 'Fotografije',
            file: 'Crno jezero 2020.jpg',
            license: 'CC BY-SA 4.0',
          }),
          item({
            type: 'photo',
            me: 'Kanjon Tare',
            en: 'Tara canyon',
            creator: 'Wikimedia Commons',
            year: 2025,
            collection: 'Fotografije',
            file: '2025-07-13 Tara River Canyon 2.jpg',
            license: 'CC BY 4.0',
          }),
          item({
            type: 'photo',
            me: 'Rijeka Crnojevića',
            en: 'Rijeka Crnojevića',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'Rijeka Crnojevića View.jpg',
            license: 'CC BY 4.0',
          }),
        ],
      ),
    ],
  },
  {
    id: 3,
    slug: 'putevima-pisane-rijeci',
    title: { me: 'Putevima pisane riječi', en: 'Along the Paths of the Written Word' },
    summary: {
      me: 'Priča na mapi: od Rijeke Crnojevića i Cetinja do Kotora, Podgorice i Durmitora, mjesta gdje se knjiga rađala i putovala.',
      en: 'A story on the map: from Rijeka Crnojevića and Cetinje to Kotor, Podgorica and Durmitor, places where the book was born and travelled.',
    },
    coverUrl: cover('Rijeka Crnojevića View.jpg'),
    template: 'map',
    status: 'published',
    period: '15. – 20. vijek',
    tags: ['Karte', 'Štamparije', 'Kulturna istorija'],
    authorId: 2,
    authorName: 'Marko Vuković',
    createdAt: '2026-10-05',
    videos: [],
    sections: [
      section(
        'Rijeka Crnojevića: kolijevka štampe',
        'Rijeka Crnojevića: cradle of printing',
        'Na Rijeci Crnojevića, u središtu države Crnojevića, nastaje prva štamparija ovog prostora.',
        'On Rijeka Crnojevića, at the heart of the Crnojević state, the first press of this region is established.',
        [
          item({
            type: 'photo',
            me: 'Rijeka Crnojevića',
            en: 'Rijeka Crnojevića',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'Rijeka Crnojevića View.jpg',
            license: 'CC BY 4.0',
          }),
        ],
        { place: place('Rijeka Crnojevića', 'Rijeka Crnojevića', 42.3578, 19.0122), year: 1494 },
      ),
      section(
        'Cetinje: prijestonica knjige',
        'Cetinje: capital of the book',
        'Cetinje postaje središte štampe, škola i prvih biblioteka. Fotohrom s kraja 19. vijeka prikazuje grad sa zapada.',
        'Cetinje becomes the centre of printing, schools and the first libraries. A late 19th century photochrom shows the town from the west.',
        [
          item({
            type: 'photo',
            me: 'Cetinje sa zapada',
            en: 'Cetinje from the west',
            creator: 'Detroit Photographic Co.',
            collection: 'World Digital Library',
            file: 'From the West, Cetinje, Montenegro WDL2608.png',
            license: 'Public domain',
          }),
        ],
        { place: place('Cetinje', 'Cetinje', 42.3931, 18.9233), year: 1890 },
      ),
      section(
        'Kotor: pomorski put',
        'Kotor: the sea route',
        'Preko Boke knjige i ideje stižu iz Venecije i Beča.',
        'Through the Bay, books and ideas arrive from Venice and Vienna.',
        [
          item({
            type: 'photo',
            me: 'Ulaz u stari grad Kotor',
            en: 'Entrance to Kotor old town',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'Kotor old town entrance.jpg',
            license: 'CC BY-SA 3.0',
          }),
        ],
        { place: place('Kotor', 'Kotor', 42.4247, 18.7712) },
      ),
      section(
        'Podgorica: nova središta',
        'Podgorica: new centres',
        'U 20. vijeku Podgorica preuzima ulogu administrativnog i kulturnog centra.',
        'In the 20th century Podgorica takes over as the administrative and cultural centre.',
        [
          item({
            type: 'photo',
            me: 'Tvrđava Ribnica',
            en: 'Ribnica fortress',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'Ribnica fortress Podgorica (1).jpg',
            license: 'CC BY 3.0 pl',
          }),
        ],
        { place: place('Podgorica', 'Podgorica', 42.4304, 19.2594) },
      ),
      section(
        'Žabljak: putopisci',
        'Žabljak: travel writers',
        'Putopisci otkrivaju sjever i planine, a njihovi zapisi ostaju u fondu biblioteke.',
        'Travel writers discover the north and the mountains, and their notes remain in the library holdings.',
        [
          item({
            type: 'photo',
            me: 'Crno jezero kod Žabljaka',
            en: 'Black Lake near Žabljak',
            creator: 'Wikimedia Commons',
            year: 2020,
            collection: 'Fotografije',
            file: 'Crno jezero 2020.jpg',
            license: 'CC BY-SA 4.0',
          }),
        ],
        { place: place('Žabljak', 'Žabljak', 43.1547, 19.1226) },
      ),
    ],
  },
  {
    id: 4,
    slug: 'cetinje-prije-i-poslije',
    title: { me: 'Cetinje: prije i poslije', en: 'Cetinje: Then and Now' },
    summary: {
      me: 'Fotohromi s kraja 19. vijeka uz savremene pogleda na ulice, manastir i okolinu Cetinja. Povucite klizač da uporedite.',
      en: 'Late 19th century photochroms next to contemporary views of Cetinje’s streets, monastery and surroundings. Drag the handle to compare.',
    },
    coverUrl: cover('From the West, Cetinje, Montenegro WDL2608.png'),
    template: 'slider',
    status: 'published',
    period: 'c. 1890 – 2021',
    tags: ['Cetinje', 'Fotografije', 'Poređenje'],
    authorId: 4,
    authorName: 'Nikola Radović',
    createdAt: '2026-10-08',
    videos: [],
    sections: [
      section(
        'Pogled sa zapada',
        'View from the west',
        'Isti grad u dva vremena: fotohrom s kraja 19. vijeka i snimak iz oktobra 2021.',
        'The same town in two times: a late 19th century photochrom and a shot from October 2021.',
        [
          item({
            type: 'photo',
            me: 'Cetinje sa zapada, c. 1890',
            en: 'Cetinje from the west, c. 1890',
            creator: 'Detroit Photographic Co.',
            year: 1890,
            collection: 'World Digital Library',
            file: 'From the West, Cetinje, Montenegro WDL2608.png',
            license: 'Public domain',
          }),
          item({
            type: 'photo',
            me: 'Cetinje, oktobar 2021.',
            en: 'Cetinje, October 2021',
            creator: 'Wikimedia Commons',
            year: 2021,
            collection: 'Fotografije',
            file: 'Cetinje, october 2021 - 03.jpg',
            license: 'CC BY-SA 4.0',
          }),
        ],
        { year: 1890 },
      ),
      section(
        'Cetinjski manastir',
        'Cetinje Monastery',
        'Manastir nekad i sad: fotohrom i savremena fotografija.',
        'The monastery then and now: a photochrom and a contemporary photograph.',
        [
          item({
            type: 'photo',
            me: 'Manastir, c. 1890',
            en: 'The convent, c. 1890',
            creator: 'Detroit Photographic Co.',
            year: 1890,
            collection: 'World Digital Library',
            file: 'The Convent, Cetinje, Montenegro WDL2609.png',
            license: 'Public domain',
          }),
          item({
            type: 'photo',
            me: 'Cetinjski manastir, danas',
            en: 'Cetinje Monastery, today',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'Cetinje monastery.jpg',
            license: 'CC BY-SA 3.0',
          }),
        ],
        { year: 1890 },
      ),
      section(
        'Dolazak pošte',
        'Arrival of the post',
        'Scena iz svakodnevnog života Cetinja krajem 19. vijeka.',
        'A scene from everyday life in Cetinje at the end of the 19th century.',
        [
          item({
            type: 'photo',
            me: 'Dolazak pošte, Cetinje',
            en: 'Arrival of the post, Cetinje',
            creator: 'Detroit Photographic Co.',
            year: 1890,
            collection: 'World Digital Library',
            file: 'Arrival of the Post, Cetinje, Montenegro WDL2610.png',
            license: 'Public domain',
          }),
        ],
        { year: 1890 },
      ),
    ],
  },
  {
    id: 5,
    slug: 'boje-crne-gore-3d',
    title: { me: 'Boje Crne Gore: virtuelna sala', en: 'Colours of Montenegro: A Virtual Hall' },
    summary: {
      me: 'Prošetajte virtuelnom salom i razgledajte fotografije gradova, jezera i planina. Pogledajte i video iz Budve.',
      en: 'Walk through a virtual hall and explore photographs of towns, lakes and mountains. Also watch a video from Budva.',
    },
    coverUrl: cover('Montenegro NP Durmitor Black Lake 01.jpg'),
    template: 'room',
    status: 'published',
    period: '2014 – 2025',
    tags: ['Fotografije', '3D', 'Pejzaži'],
    authorId: 2,
    authorName: 'Marko Vuković',
    createdAt: '2026-10-10',
    videos: [initialVideos.budva],
    sections: [
      section(
        'Gradovi',
        'Towns',
        'Primorski i stari gradovi Crne Gore.',
        'Coastal and historic towns of Montenegro.',
        [
          item({
            type: 'photo',
            me: 'Panorama Kotora',
            en: 'Panorama of Kotor',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'View over Kotor bay and old town.jpg',
            license: 'CC BY-SA 4.0',
          }),
          item({
            type: 'photo',
            me: 'Perast',
            en: 'Perast',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'Perast from a boat.jpg',
            license: 'CC BY-SA 4.0',
          }),
          item({
            type: 'photo',
            me: 'Budva',
            en: 'Budva',
            creator: 'Wikimedia Commons',
            collection: 'Fotografije',
            file: 'View of Budva Old Town.jpg',
            license: 'CC BY-SA 4.0',
          }),
          item({
            type: 'photo',
            me: 'Cetinje',
            en: 'Cetinje',
            creator: 'Wikimedia Commons',
            year: 2021,
            collection: 'Fotografije',
            file: 'Cetinje, october 2021 - 03.jpg',
            license: 'CC BY-SA 4.0',
          }),
        ],
      ),
      section('Priroda', 'Nature', 'Jezera, planine i kanjoni.', 'Lakes, mountains and canyons.', [
        item({
          type: 'photo',
          me: 'Crno jezero',
          en: 'Black Lake',
          creator: 'Wikimedia Commons',
          year: 2020,
          collection: 'Fotografije',
          file: 'Crno jezero 2020.jpg',
          license: 'CC BY-SA 4.0',
        }),
        item({
          type: 'photo',
          me: 'Kanjon Tare',
          en: 'Tara canyon',
          creator: 'Wikimedia Commons',
          year: 2025,
          collection: 'Fotografije',
          file: '2025-07-13 Tara River Canyon 1.jpg',
          license: 'CC BY 4.0',
        }),
        item({
          type: 'photo',
          me: 'Skadarsko jezero',
          en: 'Lake Skadar',
          creator: 'Wikimedia Commons',
          year: 2014,
          collection: 'Fotografije',
          file: 'Lago Skadar, Montenegro, 2014-04-14, DD 01.JPG',
          license: 'CC BY-SA 3.0',
        }),
        item({
          type: 'photo',
          me: 'Lovćen i Štirovnik',
          en: 'Lovćen and Štirovnik',
          creator: 'Wikimedia Commons',
          year: 2022,
          collection: 'Fotografije',
          file: 'Mount Lovćen and Štirovnik, Montenegro, September 2022 03.jpg',
          license: 'CC BY-SA 4.0',
        }),
      ]),
    ],
  },
  {
    id: 6,
    slug: 'zvuci-crne-gore',
    title: { me: 'Zvuci Crne Gore', en: 'Sounds of Montenegro' },
    summary: {
      me: 'Muzikalije i zvučna građa iz fonda: zapisi pjesama, gusala i orkestara.',
      en: 'Sheet music and audio material from the holdings: recordings of songs, the gusle and orchestras.',
    },
    coverUrl: makeArt('audio', 'Zvuci Crne Gore', 'Muzikalije i audiovizuelna građa', true),
    template: 'gallery',
    status: 'pending',
    period: '1900 – 1980',
    tags: ['Muzika', 'Audio'],
    authorId: 4,
    authorName: 'Nikola Radović',
    createdAt: '2026-10-20',
    videos: [],
    sections: [
      section(
        'Zapisi',
        'Recordings',
        'Odabrani zapisi iz muzičke zbirke.',
        'Selected recordings from the music collection.',
        [
          item({
            type: 'audio',
            me: 'Pjesme uz gusle',
            en: 'Songs with the gusle',
            creator: 'Nepoznat izvođač',
            year: 1955,
            collection: 'Muzikalije i audiovizuelna građa',
            license: 'Sample',
          }),
          item({
            type: 'audio',
            me: 'Gradska muzika',
            en: 'City band',
            creator: 'Nepoznat izvođač',
            year: 1938,
            collection: 'Muzikalije i audiovizuelna građa',
            license: 'Sample',
          }),
        ],
      ),
    ],
  },
  {
    id: 7,
    slug: 'montenegrina-periodika',
    title: { me: 'Montenegrina: periodika', en: 'Montenegrina: Periodicals' },
    summary: {
      me: 'Radna verzija izložbe o crnogorskoj periodici.',
      en: 'A working draft of an exhibition about Montenegrin periodicals.',
    },
    coverUrl: cover('Glas Crnogorca.jpeg'),
    template: 'timeline',
    status: 'draft',
    period: '1873 – 1921',
    tags: ['Periodika'],
    authorId: 2,
    authorName: 'Marko Vuković',
    createdAt: '2026-10-21',
    videos: [],
    sections: [
      section(
        'Početak',
        'The beginning',
        'Nacrt prve sekcije.',
        'Draft of the first section.',
        [
          item({
            type: 'periodical',
            me: 'Glas Crnogorca',
            en: 'Glas Crnogorca',
            creator: 'Redakcija lista',
            year: 1873,
            collection: 'Periodika',
            file: 'Glas Crnogorca.jpeg',
            license: 'Public domain',
          }),
        ],
        { year: 1873 },
      ),
    ],
  },
]
