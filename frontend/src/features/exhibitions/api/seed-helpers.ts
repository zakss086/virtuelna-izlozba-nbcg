import { makeArt } from '@/lib/art'

import type { ExhibitionItem, ExhibitionVideo, ItemType, Place, Section } from '../types'

// Sample data inspired by the National Library of Montenegro collections (nb-cg.me, dlib.me).
// Images and videos are freely licensed files from Wikimedia Commons, linked directly (see `credit` and `rights`).
// Texts are simplified for the demo.

let nextItemId = 1
let nextSectionId = 1
let nextVideoId = 1

export const COMMONS = 'https://commons.wikimedia.org/wiki/Special:FilePath/'
export const commons = (file: string, width = 1200) => `${COMMONS}${encodeURIComponent(file)}?width=${width}`
const commonsPage = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`

// PDF first-page thumbnails use fixed thumbnail paths on Wikimedia.
export const LUCA_PDF =
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/%D0%9F%D0%B5%D1%82%D0%B0%D1%80_%D0%9F%D0%B5%D1%82%D1%80%D0%BE%D0%B2%D0%B8%D1%9B_%D0%8A%D0%B5%D0%B3%D0%BE%D1%88_-_%D0%9B%D1%83%D1%87%D0%B0_%D0%BC%D0%B8%D0%BA%D1%80%D0%BE%D0%BA%D0%BE%D0%B7%D0%BC%D0%B0_%281845%29.pdf/page1-1280px-%D0%9F%D0%B5%D1%82%D0%B0%D1%80_%D0%9F%D0%B5%D1%82%D1%80%D0%BE%D0%B2%D0%B8%D1%9B_%D0%8A%D0%B5%D0%B3%D0%BE%D1%88_-_%D0%9B%D1%83%D1%87%D0%B0_%D0%BC%D0%B8%D0%BA%D1%80%D0%BE%D0%BA%D0%BE%D0%B7%D0%BC%D0%B0_%281845%29.pdf.jpg'
export const GLAS_PDF =
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
  language?: string
  material?: string
}

export function item(input: ItemInput): ExhibitionItem {
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
    language: input.language,
    material: input.material,
  }
}

export function section(
  me: string,
  en: string,
  textMe: string,
  textEn: string,
  items: ExhibitionItem[],
  extra: { year?: number; place?: Place } = {},
): Section {
  return { id: nextSectionId++, title: { me, en }, text: { me: textMe, en: textEn }, items, ...extra }
}

export function video(
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

export const place = (me: string, en: string, lat: number, lng: number): Place => ({
  name: { me, en },
  lat,
  lng,
})
export const cover = (file: string) => commons(file, 1600)
