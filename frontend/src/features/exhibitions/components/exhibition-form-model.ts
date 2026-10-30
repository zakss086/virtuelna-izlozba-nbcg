import { z } from 'zod'

import { makeArt } from '@/lib/art'

import { ITEM_TYPES, TEMPLATES, type Exhibition, type ExhibitionStatus, type NewExhibition } from '../types'

// Form schema, default values and the mapping between form values and the Exhibition entity.

const sectionSchema = z.object({
  titleMe: z.string().min(2),
  titleEn: z.string().min(2),
  textMe: z.string().min(10),
  textEn: z.string().min(10),
  year: z.number().int().min(1000).max(2100),
  placeName: z.string(),
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
  objectTitle: z.string().min(2),
  objectCreator: z.string().min(2),
  objectType: z.enum(ITEM_TYPES),
  objectImageUrl: z.string(),
  objectRights: z.string(),
  objectSourceUrl: z.string(),
  objectSignature: z.string(),
  objectInventory: z.string(),
  objectLanguage: z.string(),
  objectMaterial: z.string(),
  objectDimensions: z.string(),
})

export const exhibitionFormSchema = z.object({
  titleMe: z.string().min(3),
  titleEn: z.string().min(3),
  summaryMe: z.string().min(10),
  summaryEn: z.string().min(10),
  introMe: z.string(),
  introEn: z.string(),
  template: z.enum(TEMPLATES),
  period: z.string().min(2),
  tags: z.string(),
  sections: z.array(sectionSchema).min(1),
})

export type FormValues = z.infer<typeof exhibitionFormSchema>

export const emptySection: FormValues['sections'][number] = {
  titleMe: '',
  titleEn: '',
  textMe: '',
  textEn: '',
  year: 1900,
  placeName: '',
  lat: null,
  lng: null,
  objectTitle: '',
  objectCreator: '',
  objectType: 'photo',
  objectImageUrl: '',
  objectRights: '',
  objectSourceUrl: '',
  objectSignature: '',
  objectInventory: '',
  objectLanguage: '',
  objectMaterial: '',
  objectDimensions: '',
}

export function toFormValues(exhibition?: Exhibition): FormValues {
  if (!exhibition) {
    return {
      titleMe: '',
      titleEn: '',
      summaryMe: '',
      summaryEn: '',
      introMe: '',
      introEn: '',
      template: 'timeline',
      period: '',
      tags: '',
      sections: [emptySection],
    }
  }
  return {
    titleMe: exhibition.title.me,
    titleEn: exhibition.title.en,
    summaryMe: exhibition.summary.me,
    summaryEn: exhibition.summary.en,
    introMe: exhibition.intro?.me ?? '',
    introEn: exhibition.intro?.en ?? '',
    template: exhibition.template,
    period: exhibition.period,
    tags: exhibition.tags.join(', '),
    sections: exhibition.sections.map((s) => {
      const obj = s.items[0]
      return {
        titleMe: s.title.me,
        titleEn: s.title.en,
        textMe: s.text.me,
        textEn: s.text.en,
        year: s.year ?? obj?.year ?? 1900,
        placeName: s.place?.name.me ?? '',
        lat: s.place?.lat ?? null,
        lng: s.place?.lng ?? null,
        objectTitle: obj?.title.me ?? '',
        objectCreator: obj?.creator ?? '',
        objectType: obj?.type ?? 'photo',
        // A generated placeholder (a data URI) is not a picture to keep; a real one stays when the exhibition is edited.
        objectImageUrl: obj && !obj.imageUrl.startsWith('data:') ? obj.imageUrl : '',
        objectRights: obj && !obj.imageUrl.startsWith('data:') ? obj.rights : '',
        objectSourceUrl: obj && !obj.imageUrl.startsWith('data:') ? obj.sourceUrl : '',
        objectSignature: obj?.signature ?? '',
        objectInventory: obj?.inventoryNo ?? '',
        objectLanguage: obj?.language ?? '',
        objectMaterial: obj?.material ?? '',
        objectDimensions: obj?.dimensions ?? '',
      }
    }),
  }
}

export function toExhibition(
  values: FormValues,
  authorId: number,
  authorName: string,
  status: ExhibitionStatus,
  videos: Exhibition['videos'],
): NewExhibition {
  let id = Date.now()
  return {
    title: { me: values.titleMe, en: values.titleEn },
    summary: { me: values.summaryMe, en: values.summaryEn },
    intro:
      values.introMe.trim() || values.introEn.trim() ? { me: values.introMe, en: values.introEn } : undefined,
    // The cover is the picture of the first object when it has one.
    coverUrl:
      values.sections[0]?.objectImageUrl ||
      makeArt(values.sections[0]?.objectType ?? 'book', values.titleMe, values.period, true),
    template: values.template,
    status,
    period: values.period,
    tags: values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    authorId,
    authorName,
    videos,
    sections: values.sections.map((s) => ({
      id: id++,
      title: { me: s.titleMe, en: s.titleEn },
      text: { me: s.textMe, en: s.textEn },
      year: s.year,
      place:
        s.placeName && s.lat !== null && s.lng !== null
          ? { name: { me: s.placeName, en: s.placeName }, lat: s.lat, lng: s.lng }
          : undefined,
      items: [
        {
          id: id++,
          type: s.objectType,
          title: { me: s.objectTitle, en: s.objectTitle },
          creator: s.objectCreator,
          year: s.year,
          collection: 'Digitalna biblioteka',
          imageUrl: s.objectImageUrl || makeArt(s.objectType, s.objectTitle, String(s.year)),
          sourceUrl: s.objectSourceUrl || 'https://dlib.me',
          rights: s.objectRights || 'Sample',
          signature: s.objectSignature.trim() || undefined,
          inventoryNo: s.objectInventory.trim() || undefined,
          language: s.objectLanguage.trim() || undefined,
          material: s.objectMaterial.trim() || undefined,
          dimensions: s.objectDimensions.trim() || undefined,
        },
      ],
    })),
  }
}
