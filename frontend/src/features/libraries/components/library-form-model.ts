import { z } from 'zod'

import { LIBRARY_TYPES, type Library, type NewLibrary } from '../types'

// The admin form of a library, as strings, and its mapping to and from the Library entity.
// Optional groups are all or nothing: a description needs both languages, a picture its credit and licence,
// a pin its two coordinates and how exact they are.

const optional = z.string()
const coordinate = (min: number, max: number) =>
  z
    .string()
    .refine(
      (value) =>
        value === '' || (Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max),
    )

export const libraryFormSchema = z
  .object({
    name: z.string().trim().min(2),
    type: z.enum(LIBRARY_TYPES),
    city: z.string().trim().min(1),
    address: optional,
    website: optional,
    email: optional,
    phone: optional,
    descriptionMe: optional,
    descriptionEn: optional,
    imageUrl: optional,
    imageCredit: optional,
    imageLicense: optional,
    imageSourceUrl: optional,
    lat: coordinate(-90, 90),
    lng: coordinate(-180, 180),
    precision: z.enum(['exact', 'town', '']),
  })
  .superRefine((value, ctx) => {
    const filled = (...fields: string[]) => fields.filter((field) => field.trim() !== '').length
    const issue = (path: keyof typeof value) =>
      ctx.addIssue({ code: 'custom', path: [path], message: String(path) })

    const description = filled(value.descriptionMe, value.descriptionEn)
    if (description === 1) issue(value.descriptionMe.trim() === '' ? 'descriptionMe' : 'descriptionEn')

    const image = filled(value.imageUrl, value.imageCredit, value.imageLicense, value.imageSourceUrl)
    if (image > 0 && image < 4) issue('imageUrl')

    const location = filled(value.lat, value.lng, value.precision)
    if (location > 0 && location < 3) issue('lat')
  })

export type LibraryFormValues = z.infer<typeof libraryFormSchema>

export const emptyLibraryForm: LibraryFormValues = {
  name: '',
  type: 'public',
  city: '',
  address: '',
  website: '',
  email: '',
  phone: '',
  descriptionMe: '',
  descriptionEn: '',
  imageUrl: '',
  imageCredit: '',
  imageLicense: '',
  imageSourceUrl: '',
  lat: '',
  lng: '',
  precision: '',
}

export function toLibraryFormValues(library?: Library): LibraryFormValues {
  if (!library) return emptyLibraryForm
  return {
    name: library.name,
    type: library.type,
    city: library.city,
    address: library.address ?? '',
    website: library.website ?? '',
    email: library.email ?? '',
    phone: library.phone ?? '',
    descriptionMe: library.description?.me ?? '',
    descriptionEn: library.description?.en ?? '',
    imageUrl: library.image?.url ?? '',
    imageCredit: library.image?.credit ?? '',
    imageLicense: library.image?.license ?? '',
    imageSourceUrl: library.image?.sourceUrl ?? '',
    lat: library.location ? String(library.location.lat) : '',
    lng: library.location ? String(library.location.lng) : '',
    precision: library.location?.precision ?? '',
  }
}

const clean = (value: string) => value.trim() || undefined

// Every optional key is written, also as `undefined`, so saving an emptied field clears it.
export function toNewLibrary(values: LibraryFormValues): NewLibrary {
  const hasImage = values.imageUrl.trim() !== ''
  const hasLocation = values.lat.trim() !== '' && values.precision !== ''
  return {
    name: values.name.trim(),
    type: values.type,
    city: values.city.trim(),
    address: clean(values.address),
    website: clean(values.website),
    email: clean(values.email),
    phone: clean(values.phone),
    description:
      values.descriptionMe.trim() && values.descriptionEn.trim()
        ? { me: values.descriptionMe.trim(), en: values.descriptionEn.trim() }
        : undefined,
    image: hasImage
      ? {
          url: values.imageUrl.trim(),
          credit: values.imageCredit.trim(),
          license: values.imageLicense.trim(),
          sourceUrl: values.imageSourceUrl.trim(),
        }
      : undefined,
    location:
      hasLocation && values.precision !== ''
        ? { lat: Number(values.lat), lng: Number(values.lng), precision: values.precision }
        : undefined,
  }
}
