import type { Localized } from '@/lib/i18n'

import type { Exhibition } from '../types'

import { booksAndPostcards } from './seed-exhibitions-1'
import { mapAndSlider } from './seed-exhibitions-2'
import { roomAndDrafts } from './seed-exhibitions-3'
import { bookAndCarousel } from './seed-exhibitions-4'

// Sample data inspired by the National Library of Montenegro collections (nb-cg.me, dlib.me).
// The seed files next to this one hold the content; helpers live in seed-helpers.ts.
// Curator's introductions, keyed by exhibition slug.
const intros: Record<string, Localized> = {
  'od-oktoiha-do-gorskog-vijenca': {
    me: 'Izložba prati put crnogorske štampane riječi kroz četiri prelomna trenutka: Oktoih iz Crnojevića štamparije, Njegoševu Luču mikrokozma, Gorski vijenac i prvi broj Glasa Crnogorca. Svaka stanica spaja digitalizovanu građu sa kratkim kontekstom, a vremenska traka čuva redoslijed događaja.',
    en: 'The exhibition follows the Montenegrin printed word through four turning points: the Oktoih from the Crnojević press, Njegoš’s The Ray of the Microcosm, The Mountain Wreath and the first issue of Glas Crnogorca. Each stop pairs digitized material with a short context, and the timeline keeps the events in order.',
  },
  'crna-gora-u-kadru': {
    me: 'Stare razglednice i savremene fotografije postavljene su jedne uz druge da se vidi kako su se mijenjali gradovi, jezera i planine. Svaki snimak možete uvećati i pročitati ko ga je napravio i pod kojom se licencom koristi.',
    en: 'Old postcards and recent photographs are placed side by side to show how towns, lakes and mountains have changed. You can enlarge every picture and read who made it and under which licence it is used.',
  },
  'putevima-pisane-rijeci': {
    me: 'Mapa vodi kroz mjesta u kojima je nastajala i putovala crnogorska pisana riječ. Stanice su poredane tako da se može pratiti put od Cetinja do drugih gradova i putopisa o Crnoj Gori.',
    en: 'The map leads through the places where the Montenegrin written word was made and travelled. The stops are arranged so you can follow the route from Cetinje to other towns and to travel writing about Montenegro.',
  },
  'cetinje-prije-i-poslije': {
    me: 'Cetinje na starim ilustracijama i na današnjim fotografijama. Povucite klizač da uporedite isto mjesto nekada i sada.',
    en: 'Cetinje in old illustrations and in present-day photographs. Drag the handle to compare the same place then and now.',
  },
  'boje-crne-gore-3d': {
    me: 'Virtuelna sala sa fotografijama gradova, jezera i planina. Okrenite pogled, približite se okvirima i otvorite detalje o svakoj fotografiji.',
    en: 'A virtual hall with photographs of towns, lakes and mountains. Look around, step closer to the frames and open the details of each photograph.',
  },
  'stranice-crnogorske-knjige': {
    me: 'Četiri djela koja su oblikovala crnogorsku štampanu riječ, postavljena kao knjiga koju listate. Na svakom razvijenom listu lijevo je slika, a desno kratak tekst, dok posljednja stranica navodi izvore i prava.',
    en: 'Four works that shaped the Montenegrin printed word, laid out as a book you turn. Each spread has a picture on the left and a short text on the right, and the last page lists sources and rights.',
  },
  'crna-gora-u-krugu': {
    me: 'Deset fotografija poredanih u prsten koji se polako okreće. Zaustavite ga kad vam se nešto dopadne, pa otvorite detalje i uvećajte sliku.',
    en: 'Ten photographs arranged in a slowly turning ring. Stop it when something catches your eye, then open the details and enlarge the picture.',
  },
}

export const initialExhibitions: Exhibition[] = [
  ...booksAndPostcards,
  ...mapAndSlider,
  ...roomAndDrafts,
  ...bookAndCarousel,
].map((exhibition) => ({ ...exhibition, intro: intros[exhibition.slug] }))
