import type { Exhibition } from '../types'

import { booksAndPostcards } from './seed-exhibitions-1'
import { mapAndSlider } from './seed-exhibitions-2'
import { roomAndDrafts } from './seed-exhibitions-3'
import { bookAndCarousel } from './seed-exhibitions-4'

// Sample data inspired by the National Library of Montenegro collections (nb-cg.me, dlib.me).
// The seed files next to this one hold the content; helpers live in seed-helpers.ts.
export const initialExhibitions: Exhibition[] = [...booksAndPostcards, ...mapAndSlider, ...roomAndDrafts, ...bookAndCarousel]
